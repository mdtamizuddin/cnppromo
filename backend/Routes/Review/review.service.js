const Review = require("./review.model");

const getReviews = async (query = {}) => {
  try {
    let filter = {};
    if (query.featured === "true") {
      filter.featured = true;
    }
    if (query.rating && query.rating !== "all") {
      filter.rating = Number(query.rating);
    }
    if (query.status) {
      filter.status = query.status;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    // Seed default reviews if DB is empty
    if (reviews.length === 0 && Object.keys(filter).length === 0) {
      const defaultReviews = [
        {
          name: "তানজিম হাসান",
          username: "tanzim99",
          rating: 5,
          comment: "CNP Promo খুব বিশ্বস্ত একটি প্ল্যাটফর্ম। আমি আজকেই bKash এ প্রথম ৫০০ টাকা পেমেন্ট পেয়েছি। অনেক ধন্যবাদ!",
          district: "ঢাকা",
          featured: true,
          status: "approved",
          avatar: "https://i.pravatar.cc/150?u=tanzim",
        },
        {
          name: "সুমাইয়া আক্তার",
          username: "sumaiya_bd",
          rating: 5,
          comment: "ভিডিও দেখে ও সোশ্যাল টাস্ক করে সহজে ইনকাম করা যায়। রেফারেল কমিশনও ইনস্ট্যান্ট যোগ হয়।",
          district: "চট্টগ্রাম",
          featured: true,
          status: "approved",
          avatar: "https://i.pravatar.cc/150?u=sumaiya",
        },
        {
          name: "রাকিব চৌধুরী",
          username: "rakib_pro",
          rating: 4,
          comment: "পেমেন্ট খুব ফাস্ট। উইথড্র দেওয়ার মাত্র ২ ঘণ্টার মধ্যে Nagad এ টাকা চলে এসেছে।",
          district: "সিলেট",
          featured: true,
          status: "approved",
          avatar: "https://i.pravatar.cc/150?u=rakib",
        },
        {
          name: "মেহেদী হাসান",
          username: "mehedi_01",
          rating: 5,
          comment: "Best micro-job earning platform in Bangladesh! 100% recommended for students.",
          district: "রাজশাহী",
          featured: true,
          status: "approved",
          avatar: "https://i.pravatar.cc/150?u=mehedi",
        },
      ];
      await Review.insertMany(defaultReviews);
      return await Review.find(filter).sort({ createdAt: -1 });
    }

    return reviews;
  } catch (error) {
    throw new Error(error);
  }
};

const createReview = async (data) => {
  try {
    const review = new Review(data);
    await review.save();
    return review;
  } catch (error) {
    throw new Error(error);
  }
};

const updateReview = async (id, data) => {
  try {
    const review = await Review.findByIdAndUpdate(id, data, { new: true });
    return review;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteReview = async (id) => {
  try {
    await Review.findByIdAndDelete(id);
    return { message: "Review deleted successfully" };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
