const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../util/mongodb");
const { syncHistoricalTransactions } = require("../Routes/Transaction/transaction.service");

async function run() {
  console.log("=== Starting Historical Transactions Backfill ===");
  try {
    await connectDB();

    // Wait for connection to become ready
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }

    console.log("Connected to MongoDB. Running backfill across all historical collections...");
    const stats = await syncHistoricalTransactions(null);

    console.log("\n================ Backfill Summary ================");
    console.log(`- Total Withdrawals:          ${stats.totalWithdrawals}`);
    console.log(`- Total External Withdrawals: ${stats.totalExternalWithdrawals}`);
    console.log(`- Total TopUps:               ${stats.totalTopups}`);
    console.log(`- Total Referrals:            ${stats.totalRefers}`);
    console.log(`- Total Work Submits:         ${stats.totalWorkSubmits}`);
    console.log(`- Total Legacy Docs Checked:  ${stats.totalProcessed}`);
    console.log(`- New Transactions Inserted:  ${stats.newTransactionsInserted}`);
    console.log("==================================================\n");

    console.log("✅ Backfill completed successfully! Transaction collection is now fully synchronized as the primary ledger.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Backfill failed with error:", err);
    process.exit(1);
  }
}

run();
