const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3001,
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ticoautos",
  dnsServers: (process.env.DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
};

module.exports = env;
