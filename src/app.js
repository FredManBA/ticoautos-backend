const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const errorHandler = require("./middlewares/error.middleware");
const notFoundHandler = require("./middlewares/notFound.middleware");
const { sendSuccess } = require("./utils/apiResponse");

const app = express();

const corsOptions = {
  origin:
    env.clientOrigin === "*"
      ? "*"
      : env.clientOrigin.split(",").map((origin) => origin.trim()),
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/vehicles", require("./routes/vehicle.routes"));
app.use("/api/questions", require("./routes/question.routes"));

app.get("/api/health", (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: "TicoAutos backend is running",
    data: {
      status: "ok",
      environment: env.nodeEnv,
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
