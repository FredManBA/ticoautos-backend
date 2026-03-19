const mongoose = require("mongoose");

const env = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log(`MongoDB connected on ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
