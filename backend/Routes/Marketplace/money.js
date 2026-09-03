// User.balance is a plain JS Number (BSON double) in whole takas. The
// marketplace is the first feature to write sub-taka amounts (e.g. 1.80), so
// every money value it writes goes through this to keep balances from
// drifting via float error.
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

module.exports = { round2 };
