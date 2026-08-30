const PaymentProof = require("./proof.model");

const getProofs = async (query = {}) => {
  try {
    let filter = {};
    if (query.method && query.method !== "all") {
      filter.method = query.method;
    }
    if (query.featured === "true") {
      filter.featured = true;
    }

    const proofs = await PaymentProof.find(filter).sort({ createdAt: -1 });

    // Seed default sample proofs if DB is empty
    if (proofs.length === 0 && Object.keys(filter).length === 0) {
      const defaultProofs = [
        {
          imageUrl: "/reviews-images/image-1.jpeg",
          method: "bKash",
          amount: 5250,
          recipient: "মো: রাকিবুল ইসলাম",
          trxId: "8GJ3K8F6",
          note: "উইথড্র পেমেন্ট সফলভাবে ট্রান্সফার করা হয়েছে",
          featured: true,
        },
        {
          imageUrl: "/reviews-images/image-2.jpeg",
          method: "Nagad",
          amount: 3850,
          recipient: "সায়েম আহমেদ",
          trxId: "28736273823",
          note: "রেফারেল কমিশন ও টাস্ক উইথড্র",
          featured: true,
        },
        {
          imageUrl: "/reviews-images/image-3.jpeg",
          method: "Rocket",
          amount: 7200,
          recipient: "আকতার জামান",
          trxId: "2KBJ6H3L1",
          note: "ভিআইপি মেম্বার উইথড্র পেমেন্ট",
          featured: true,
        },
        {
          imageUrl: "/reviews-images/image-4.jpeg",
          method: "bKash",
          amount: 4100,
          recipient: "ইমরান হোসেন",
          trxId: "4F7H9J2K1",
          note: "রেগুলার উইথড্র প্রসেসড",
          featured: true,
        },
      ];
      await PaymentProof.insertMany(defaultProofs);
      return await PaymentProof.find(filter).sort({ createdAt: -1 });
    }

    return proofs;
  } catch (error) {
    throw new Error(error);
  }
};

const createProof = async (data) => {
  try {
    const proof = new PaymentProof(data);
    await proof.save();
    return proof;
  } catch (error) {
    throw new Error(error);
  }
};

const updateProof = async (id, data) => {
  try {
    const proof = await PaymentProof.findByIdAndUpdate(id, data, { new: true });
    return proof;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteProof = async (id) => {
  try {
    await PaymentProof.findByIdAndDelete(id);
    return { message: "Payment proof deleted successfully" };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getProofs,
  createProof,
  updateProof,
  deleteProof,
};
