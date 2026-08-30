const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const service = require("./review.service");

// Public: Get all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await service.getReviews(req.query);
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Add a review manually
router.post("/", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const { name, username, rating, comment, avatar, district, featured } = req.body;
    if (!name || !comment) {
      return res.status(400).send({ message: "Name and comment are required" });
    }

    const review = await service.createReview({
      name,
      username: username || name.toLowerCase().replace(/\s+/g, "_"),
      rating: Number(rating) || 5,
      comment,
      avatar: avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`,
      district: district || "Dhaka",
      featured: featured !== undefined ? featured : true,
      status: "approved",
    });

    res.send(review);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Update review (e.g. toggle featured / status)
router.put("/:id", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const review = await service.updateReview(req.params.id, req.body);
    res.send(review);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Admin: Delete review
router.delete("/:id", authChecker, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).send({ message: "Forbidden" });
    }
    const response = await service.deleteReview(req.params.id);
    res.send(response);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
