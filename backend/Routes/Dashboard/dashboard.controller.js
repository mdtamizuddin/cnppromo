const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");

const User = require("../User/user.model");
const Withdraw = require("../WithDraw/withdraw.model");
const Topup = require("../TopUp/topup.model");
const External = require("../external-withdraw/external.model");
const { MarketTask, TaskSubmission } = require("../Marketplace/task.model");
const PlatformLedger = require("../Marketplace/ledger.model");

// ─── In-memory TTL cache ──────────────────────────────────────────────────────
// No external dependency (no Redis) needed — a single admin dashboard endpoint
// shared by a handful of admins is ideal for a simple module-level cache.
//
//  • TTL: 30 s — data is fresh enough for a live dashboard.
//  • Request coalescing: if 5 admins open the dashboard simultaneously we run
//    exactly ONE DB query and serve all 5 from its result.
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 30_000;       // 30 seconds
let _cache = null;              // { data, expiresAt }  — null when cold
let _inflight = null;              // Promise<data>        — shared while DB query runs

/**
 * GET /dashboard/stats
 * Requires: admin or moderator role.
 *
 * Optimisations:
 *  1. All 7 independent DB queries run in parallel (Promise.all).
 *  2. Each collection's multi-condition counts/sums use $facet so MongoDB
 *     processes everything in a single pass per collection.
 *  3. Daily earnings chart: was 15 separate aggregations → now 1 $group pipeline.
 *  4. 30-second in-memory cache + request coalescing (see above).
 */
router.get("/stats", authChecker, roleChecker(["admin", "moderator"]), async (req, res) => {
    try {
        // ── 1. Cache HIT ──────────────────────────────────────────────────────
        if (_cache && Date.now() < _cache.expiresAt) {
            res.setHeader("X-Cache", "HIT");
            return res.json(_cache.data);
        }

        // ── 2. Coalesce concurrent requests ───────────────────────────────────
        //    If a query is already running (e.g. two admins hit at once), wait
        //    for the shared promise instead of launching a second DB round.
        if (_inflight) {
            res.setHeader("X-Cache", "COALESCED");
            return res.json(await _inflight);
        }

        // ── 3. Cache MISS — run the DB queries ────────────────────────────────
        _inflight = _fetchStats();
        try {
            const data = await _inflight;
            _cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
            res.setHeader("X-Cache", "MISS");
            return res.json(data);
        } finally {
            _inflight = null; // always release the lock
        }
    } catch (error) {
        console.error("[Dashboard Stats]", error);
        res.status(500).json({ message: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Core data-fetching function — called at most once per 30 s
// ─────────────────────────────────────────────────────────────────────────────
async function _fetchStats() {
    const now = new Date();

    // Date boundaries (computed once, reused across all queries)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const chart15DaysAgo = new Date(startOfToday);
    chart15DaysAgo.setDate(startOfToday.getDate() - 14); // 15-day window incl. today

    // ── All 7 DB operations run concurrently ──────────────────────────────────
    const [
        userFacet,
        withdrawFacet,
        topupFacet,
        externalCount,
        marketplaceFacet,
        recentWithdrawals,
        recentTopups,
        recentUsers,
    ] = await Promise.all([

        // 1. User stats — one $facet, six branches
        User.aggregate([{
            $facet: {
                total: [{ $match: { role: "user" } }, { $count: "n" }],
                active: [{ $match: { role: "user", status: "active" } }, { $count: "n" }],
                pending: [{ $match: { role: "user", status: "pending" } }, { $count: "n" }],
                banned: [{ $match: { lock: true } }, { $count: "n" }],
                newToday: [{ $match: { role: "user", createdAt: { $gte: startOfToday } } }, { $count: "n" }],
                newThisMonth: [{ $match: { role: "user", createdAt: { $gte: startOfThisMonth } } }, { $count: "n" }],
            }
        }]),

        // 2. Withdrawal stats — counts + amount sums + daily chart, ONE pipeline
        Withdraw.aggregate([{
            $facet: {
                // Status counts
                statusCounts: [
                    { $group: { _id: "$status", n: { $sum: 1 } } }
                ],
                // All-time completed amount
                totalAmount: [
                    { $match: { status: "completed" } },
                    { $group: { _id: null, v: { $sum: "$amount" } } }
                ],
                // Time-window amounts computed in one pass using $cond
                windowAmounts: [
                    { $match: { status: "completed", createdAt: { $gte: startOfLastMonth } } },
                    {
                        $group: {
                            _id: null,
                            today: { $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, "$amount", 0] } },
                            week: { $sum: { $cond: [{ $gte: ["$createdAt", startOfThisWeek] }, "$amount", 0] } },
                            month: { $sum: { $cond: [{ $gte: ["$createdAt", startOfThisMonth] }, "$amount", 0] } },
                            lastMonth: {
                                $sum: {
                                    $cond: [
                                        { $and: [{ $gte: ["$createdAt", startOfLastMonth] }, { $lte: ["$createdAt", endOfLastMonth] }] },
                                        "$amount", 0
                                    ]
                                }
                            },
                        }
                    }
                ],
                // Daily chart: 15 days — ONE group-by-date query replaces 15 separate aggregations
                dailyChart: [
                    { $match: { status: "completed", createdAt: { $gte: chart15DaysAgo } } },
                    {
                        $group: {
                            _id: {
                                y: { $year: "$createdAt" },
                                m: { $month: "$createdAt" },
                                d: { $dayOfMonth: "$createdAt" }
                            },
                            amount: { $sum: "$amount" }
                        }
                    },
                    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } }
                ]
            }
        }]),

        // 3. Topup stats — counts + total amount + window sums + daily chart, ONE pipeline
        Topup.aggregate([{
            $facet: {
                statusCounts: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
                totalAmount: [{ $match: { status: "completed" } }, { $group: { _id: null, v: { $sum: "$amount" } } }],
                windowAmounts: [
                    { $match: { status: "completed", createdAt: { $gte: startOfThisMonth } } },
                    {
                        $group: {
                            _id: null,
                            today: { $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, "$amount", 0] } },
                            week: { $sum: { $cond: [{ $gte: ["$createdAt", startOfThisWeek] }, "$amount", 0] } },
                            month: { $sum: "$amount" },
                        }
                    }
                ],
                dailyChart: [
                    { $match: { status: "completed", createdAt: { $gte: chart15DaysAgo } } },
                    {
                        $group: {
                            _id: {
                                y: { $year: "$createdAt" },
                                m: { $month: "$createdAt" },
                                d: { $dayOfMonth: "$createdAt" }
                            },
                            amount: { $sum: "$amount" }
                        }
                    },
                    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } }
                ]
            }
        }]),

        // 4. External withdrawals pending count
        External.countDocuments({ status: "pending" }),

        // 5. Marketplace — pending moderation, active tasks, pending
        //    submissions, open reports + platform revenue (run together)
        Promise.all([
            MarketTask.countDocuments({ status: "PENDING_APPROVAL" }),
            MarketTask.countDocuments({ status: "ACTIVE" }),
            TaskSubmission.countDocuments({ status: "PENDING" }),
            TaskSubmission.countDocuments({ status: "REPORTED" }),
            PlatformLedger.aggregate([
                { $match: { type: { $in: ["PLATFORM_FEE", "PROVIDER_FINE"] } } },
                { $group: { _id: null, v: { $sum: "$amount" } } },
            ]),
        ]).then(([pendingApproval, active, pendingSubmissions, openReports, revenueFacet]) => ({
            pendingApproval, active, pendingSubmissions, openReports,
            revenue: revenueFacet[0]?.v || 0,
        })),

        // 6. Recent withdrawals (with user info)  — .lean() avoids Mongoose hydration overhead
        Withdraw.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email avatar username")
            .lean(),

        // 7. Recent topups (with user info)
        Topup.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email avatar username")
            .lean(),

        // 8. Recent onboarded (newly signed-up) users
        User.find({ role: "user" })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email avatar username createdAt status")
            .lean(),
    ]);

    // ── Unpack results ────────────────────────────────────────────────────────

    const [uFacet] = userFacet;
    const users = {
        total: uFacet.total[0]?.n || 0,
        active: uFacet.active[0]?.n || 0,
        pending: uFacet.pending[0]?.n || 0,
        banned: uFacet.banned[0]?.n || 0,
        newToday: uFacet.newToday[0]?.n || 0,
        newThisMonth: uFacet.newThisMonth[0]?.n || 0,
    };

    const [wFacet] = withdrawFacet;
    const wStatusMap = Object.fromEntries((wFacet.statusCounts || []).map(s => [s._id, s.n]));
    const wWin = wFacet.windowAmounts[0] || {};
    const totalWithdrawAmount = wFacet.totalAmount[0]?.v || 0;
    const monthWithdrawAmount = wWin.month || 0;
    const lastMonthWithdrawAmount = wWin.lastMonth || 0;
    const earningsGrowthPct = lastMonthWithdrawAmount > 0
        ? (((monthWithdrawAmount - lastMonthWithdrawAmount) / lastMonthWithdrawAmount) * 100).toFixed(1)
        : 0;

    // Dense 15-day array — gaps filled with 0 so the chart always has 15 points
    const dailyEarningsMap = new Map(
        (wFacet.dailyChart || []).map(d => [
            `${d._id.y}-${String(d._id.m).padStart(2, "0")}-${String(d._id.d).padStart(2, "0")}`,
            d.amount
        ])
    );
    const dailyEarnings = Array.from({ length: 15 }, (_, i) => {
        const d = new Date(chart15DaysAgo);
        d.setDate(chart15DaysAgo.getDate() + i);
        const key = d.toISOString().split("T")[0];
        return { date: key, amount: dailyEarningsMap.get(key) || 0 };
    });

    const [tFacet] = topupFacet;
    const tStatusMap = Object.fromEntries((tFacet.statusCounts || []).map(s => [s._id, s.n]));
    const tWin = tFacet.windowAmounts[0] || {};

    // Daily topup (inflow) map, same dense 15-day shaping as withdrawals
    const dailyTopupMap = new Map(
        (tFacet.dailyChart || []).map(d => [
            `${d._id.y}-${String(d._id.m).padStart(2, "0")}-${String(d._id.d).padStart(2, "0")}`,
            d.amount
        ])
    );
    // Combined series: { date, in: topup, out: withdraw } — drives the inflow/outflow chart
    const dailyFlow = dailyEarnings.map(({ date, amount }) => ({
        date,
        in: dailyTopupMap.get(date) || 0,
        out: amount,
    }));

    const totalTopupAmount = tFacet.totalAmount[0]?.v || 0;
    const netBalance = totalTopupAmount - totalWithdrawAmount;

    return {
        users,
        withdrawals: {
            pending: wStatusMap.pending || 0,
            completed: wStatusMap.completed || 0,
            rejected: wStatusMap.rejected || 0,
            pendingExternal: externalCount,
            totalAmount: totalWithdrawAmount,
            todayAmount: wWin.today || 0,
            weekAmount: wWin.week || 0,
            monthAmount: monthWithdrawAmount,
            lastMonthAmount: lastMonthWithdrawAmount,
            monthGrowthPct: Number(earningsGrowthPct),
        },
        topups: {
            pending: tStatusMap.pending || 0,
            completed: tStatusMap.completed || 0,
            totalAmount: totalTopupAmount,
            todayAmount: tWin.today || 0,
            weekAmount: tWin.week || 0,
            monthAmount: tWin.month || 0,
        },
        finance: {
            totalInflow: totalTopupAmount,
            totalOutflow: totalWithdrawAmount,
            netBalance,
        },
        marketplace: {
            pendingApproval: marketplaceFacet.pendingApproval,
            active: marketplaceFacet.active,
            pendingSubmissions: marketplaceFacet.pendingSubmissions,
            openReports: marketplaceFacet.openReports,
            revenue: marketplaceFacet.revenue,
        },
        charts: {
            dailyEarnings,  // [{date, amount}] — last 15 days, no gaps (withdrawals)
            dailyFlow,      // [{date, in, out}] — inflow vs outflow for the same window
        },
        recent: {
            withdrawals: recentWithdrawals,
            topups: recentTopups,
            onboarded: recentUsers,
        },
    };
}

module.exports = router;
