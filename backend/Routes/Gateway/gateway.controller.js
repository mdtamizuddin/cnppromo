const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const service = require("./gateway.service");

// Public: Get all active gateways (for user deposits/withdrawals)
router.get("/", async (req, res) => {
  try {
    const gateways = await service.getGateways({ status: "Active" });
    res.send(gateways);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Get all gateways with full statistics
router.get("/all", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const stats = await service.getGatewayStats();
    res.send(stats);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Get recent transactions for a gateway
router.get("/:name/transactions", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const transactions = await service.getGatewayTransactions(req.params.name);
    res.send(transactions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Create a new gateway
router.post("/", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const { name, accountNumber } = req.body;
    if (!name || !accountNumber) {
      return res.status(400).send({ message: "Gateway name and account number are required" });
    }

    const gateway = await service.createGateway(req.body);
    res.send(gateway);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Update gateway
router.put("/:id", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const gateway = await service.updateGateway(req.params.id, req.body);
    res.send(gateway);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Delete gateway
router.delete("/:id", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const response = await service.deleteGateway(req.params.id);
    res.send(response);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
