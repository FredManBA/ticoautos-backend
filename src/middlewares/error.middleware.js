const env = require("../config/env");
const {
  ApiError,
  mapMongooseValidationErrors,
  mapDuplicateKeyError,
} = require("../utils/apiResponse");

const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors = [];

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error?.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
    errors = mapMongooseValidationErrors(error);
  } else if (error?.code === 11000) {
    statusCode = 409;
    message = "Duplicate value error";
    errors = mapDuplicateKeyError(error);
  }

  if (statusCode === 500) {
    console.error(error);
  }

  const response = {
    success: false,
    message,
    errors,
  };

  if (env.nodeEnv !== "production" && statusCode === 500) {
    response.debug = {
      message: error.message,
    };
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
