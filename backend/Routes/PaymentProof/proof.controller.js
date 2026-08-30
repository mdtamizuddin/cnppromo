const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const service = require("./proof.service");

// Public: Get all payment proofs
router.get("/", async (req, res) => {
  try {
    const proofs = await service.getProofs(req.query);
    res.send(proofs);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Add payment proof manually
router.post("/", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const { imageUrl, method, amount, recipient, trxId, note, featured, date } = req.body;
    if (!imageUrl || !amount || !recipient) {
      return res.status(400).send({ message: "Image, amount, and recipient are required" });
    }

    const proof = await service.createProof({
      imageUrl,
      method: method || "bKash",
      amount: Number(amount),
      recipient,
      trxId: trxId || "",
      note: note || "পেমেন্ট সফলভাবে সম্পন্ন হয়েছে",
      featured: featured !== undefined ? featured : true,
      date: date || new Date().toLocaleDateString("bn-BD"),
      status: "পেমেন্ট সফল",
    });

    res.send(proof);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Update payment proof
router.put("/:id", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const proof = await service.updateProof(req.params.id, req.body);
    res.send(proof);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Delete payment proof
router.delete("/:id", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const response = await service.deleteProof(req.params.id);
    res.send(response);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
