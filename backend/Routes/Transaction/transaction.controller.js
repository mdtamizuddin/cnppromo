const express = require("express");
const router = express.Router();
const roleChecker = require("../../util/roleChecker");
const transactionService = require("./transaction.service");

// Admin: Adjust a user's balance (Credit / Debit) and issue a transaction
router.post("/adjust", roleChecker(["admin"]), async (req, res) => {
  try {
    const { userId, amount, type, note, title } = req.body;
    if (!userId || amount === undefined || !type) {
      return res.status(400).send({
        message: "userId, amount, and type ('credit' or 'debit') are required",
      });
    }

    const result = await transactionService.adjustBalance({
      adminId: req.user._id,
      userId,
      amount,
      type,
      note,
      title,
    });

    res.send(result);
  } catch (error) {
    res.status(400).send({
      message: error.message || "Failed to adjust balance",
    });
  }
});

// Get transactions for a user: Accessible by the user themselves or by Admin/Moderator
router.get("/user/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const isSelf = String(req.user._id) === String(targetUserId);
    const isStaff = req.user.role === "admin" || req.user.role === "moderator";

    if (!isSelf && !isStaff) {
      return res.status(403).send({ message: "Access denied" });
    }

    const transactions = await transactionService.getUserTransactions(
      targetUserId,
      req.query.limit
    );
    res.send(transactions);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Failed to fetch transactions",
    });
  }
});

// User: Get own transactions
router.get("/my", async (req, res) => {
  try {
    const transactions = await transactionService.getUserTransactions(
      req.user._id,
      req.query.limit
    );
    res.send(transactions);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Failed to fetch transactions",
    });
  }
});

// Unified earnings / transactions feed with server-side pagination
router.get("/feed", async (req, res) => {
  try {
    const targetUserId =
      req.query.user && (req.user.role === "admin" || req.user.role === "moderator")
        ? req.query.user
        : req.user._id;

    const result = await transactionService.getUserEarningsFeed(targetUserId, req.query);
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Failed to fetch earnings feed",
    });
  }
});

module.exports = router;
