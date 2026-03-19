const { createError } = require("../utils/apiResponse");

const notFoundHandler = (req, res, next) =>
  next(
    createError(404, "Route not found", [
      {
        field: "route",
        message: `${req.method} ${req.originalUrl} does not exist`,
      },
    ])
  );

module.exports = notFoundHandler;
