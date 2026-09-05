const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB initial connection error: ${error.message}`);
    // Retry connecting after 5 seconds instead of crashing the server process
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Waiting for automatic reconnection...");
});

module.exports = connectDB;