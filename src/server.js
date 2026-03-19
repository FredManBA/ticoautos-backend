const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`TicoAutos backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Unable to start TicoAutos backend:", error.message);
    process.exit(1);
  }
};

startServer();
