const dns = require("dns");
const mongoose = require("mongoose");

const env = require("./env");

const connectDB = async () => {
  try {
    if (env.dnsServers.length > 0) {
      dns.setServers(env.dnsServers);
    }

    await mongoose.connect(env.mongodbUri);
    console.log(`MongoDB connected on ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
