const { sweepAutoApprove, sweepMediaPurge } = require("./task.service");

const INTERVAL_MS = 15 * 60 * 1000;

/**
 * One shared 15-minute tick for everything the marketplace needs on a timer:
 * auto-approving overdue submissions (+ the 24h reminder) and the
 * media-purge backstop for tasks that finished while a rejection was still
 * contestable. Both queries are index-backed and return nothing in the
 * common case.
 *
 * Wrapped in try/catch — an unhandled rejection inside a timer callback
 * would otherwise take the whole process down.
 */
const runSweep = async () => {
    try {
        await sweepAutoApprove();
    } catch (error) {
        console.error("[Marketplace] sweepAutoApprove failed:", error.message);
    }
    try {
        await sweepMediaPurge();
    } catch (error) {
        console.error("[Marketplace] sweepMediaPurge failed:", error.message);
    }
};

const startSweep = () => {
    setInterval(runSweep, INTERVAL_MS);
    // Run once shortly after boot too, rather than waiting a full interval.
    setTimeout(runSweep, 30 * 1000);
};

module.exports = { startSweep, runSweep };
