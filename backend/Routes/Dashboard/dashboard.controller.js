const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");

const User = require("../User/user.model");
const Withdraw = require("../WithDraw/withdraw.model");
const Topup = require("../TopUp/topup.model");
const External = require("../external-withdraw/external.model");
const { Work: SocialWork, WorkSubmit } = require("../social-works/work.model");

/**
 * GET /dashboard/stats
 * Returns all data needed by the Admin Dashboard in a single request.
 * Requires: admin or moderator role.
 */
router.get("/stats", authChecker, roleChecker(["admin", "moderator"]), async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const startOfThisWeek  = new Date(now);
        startOfThisWeek.setDate(now.getDate() - now.getDay());
        startOfThisWeek.setHours(0, 0, 0, 0);

        // ── User Counts (parallel) ──
        const [
            totalUsers,
            activeUsers,
            pendingUsers,
            bannedUsers,
            newUsersToday,
            newUsersThisMonth,
        ] = await Promise.all([
            User.countDocuments({ role: "user" }),
            User.countDocuments({ status: "active", role: "user" }),
            User.countDocuments({ status: "pending", role: "user" }),
            User.countDocuments({ lock: true }),
            User.countDocuments({ role: "user", createdAt: { $gte: startOfToday } }),
            User.countDocuments({ role: "user", createdAt: { $gte: startOfThisMonth } }),
        ]);

        // ── Withdrawal Stats ──
        const [
            pendingWithdrawals,
            completedWithdrawals,
            rejectedWithdrawals,
            pendingExternalWithdrawals,
        ] = await Promise.all([
            Withdraw.countDocuments({ status: "pending" }),
            Withdraw.countDocuments({ status: "completed" }),
            Withdraw.countDocuments({ status: "rejected" }),
            External.countDocuments({ status: "pending" }),
        ]);

        // Withdrawal amounts
        const withdrawAmountAgg = await Withdraw.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const withdrawAmountTodayAgg = await Withdraw.aggregate([
            { $match: { status: "completed", createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const withdrawAmountWeekAgg = await Withdraw.aggregate([
            { $match: { status: "completed", createdAt: { $gte: startOfThisWeek } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const withdrawAmountMonthAgg = await Withdraw.aggregate([
            { $match: { status: "completed", createdAt: { $gte: startOfThisMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const withdrawAmountLastMonthAgg = await Withdraw.aggregate([
            { $match: { status: "completed", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalWithdrawAmount    = withdrawAmountAgg[0]?.total || 0;
        const todayWithdrawAmount    = withdrawAmountTodayAgg[0]?.total || 0;
        const weekWithdrawAmount     = withdrawAmountWeekAgg[0]?.total || 0;
        const monthWithdrawAmount    = withdrawAmountMonthAgg[0]?.total || 0;
        const lastMonthWithdrawAmount = withdrawAmountLastMonthAgg[0]?.total || 0;

        // Month-over-month growth for earnings
        const earningsGrowthPct = lastMonthWithdrawAmount > 0
            ? (((monthWithdrawAmount - lastMonthWithdrawAmount) / lastMonthWithdrawAmount) * 100).toFixed(1)
            : 0;

        // ── Topup Stats ──
        const [pendingTopups, completedTopups] = await Promise.all([
            Topup.countDocuments({ status: "pending" }),
            Topup.countDocuments({ status: "completed" }),
        ]);
        const topupAmountAgg = await Topup.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalTopupAmount = topupAmountAgg[0]?.total || 0;

        // ── Social Work Stats ──
        const [totalSocialWorks, pendingSubmissions] = await Promise.all([
            SocialWork.countDocuments({ status: "active" }),
            WorkSubmit.countDocuments({ status: "pending" }),
        ]);

        // ── Daily earnings chart: last 15 days ──
        const last15Days = Array.from({ length: 15 }, (_, i) => {
            const d = new Date(now);
            d.setDate(now.getDate() - (14 - i));
            d.setHours(0, 0, 0, 0);
            return d;
        });

        const dailyEarnings = await Promise.all(
            last15Days.map(async (dayStart) => {
                const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
                const agg = await Withdraw.aggregate([
                    { $match: { status: "completed", createdAt: { $gte: dayStart, $lt: dayEnd } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]);
                return { date: dayStart.toISOString().split("T")[0], amount: agg[0]?.total || 0 };
            })
        );

        // ── Recent withdrawals (latest 5) ──
        const recentWithdrawals = await Withdraw.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email avatar username");

        // ── Recent topups (latest 5) ──
        const recentTopups = await Topup.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email avatar username");

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                pending: pendingUsers,
                banned: bannedUsers,
                newToday: newUsersToday,
                newThisMonth: newUsersThisMonth,
            },
            withdrawals: {
                pending: pendingWithdrawals,
                completed: completedWithdrawals,
                rejected: rejectedWithdrawals,
                pendingExternal: pendingExternalWithdrawals,
                totalAmount: totalWithdrawAmount,
                todayAmount: todayWithdrawAmount,
                weekAmount: weekWithdrawAmount,
                monthAmount: monthWithdrawAmount,
                lastMonthAmount: lastMonthWithdrawAmount,
                monthGrowthPct: Number(earningsGrowthPct),
            },
            topups: {
                pending: pendingTopups,
                completed: completedTopups,
                totalAmount: totalTopupAmount,
            },
            socialWorks: {
                active: totalSocialWorks,
                pendingSubmissions,
            },
            charts: {
                dailyEarnings,   // [{date, amount}] — last 15 days
            },
            recent: {
                withdrawals: recentWithdrawals,
                topups: recentTopups,
            },
        });
    } catch (error) {
        console.error("[Dashboard Stats]", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
