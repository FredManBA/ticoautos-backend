const mongoose = require("mongoose");
const { createError } = require("../utils/apiResponse");

const validateCreateQuestion = (req, res, next) => {
  const { vehicleId, message, askedBy, status } = req.body;
  const errors = [];

  if (askedBy !== undefined) {
    errors.push({
      field: "askedBy",
      message: "askedBy cannot be sent by the client",
    });
  }

  if (status !== undefined) {
    errors.push({
      field: "status",
      message: "status cannot be sent by the client",
    });
  }

  if (!vehicleId || !String(vehicleId).trim()) {
    errors.push({
      field: "vehicleId",
      message: "vehicleId is required",
    });
  } else if (!mongoose.isValidObjectId(vehicleId)) {
    errors.push({
      field: "vehicleId",
      message: "vehicleId is invalid",
    });
  }

  if (!message || !String(message).trim()) {
    errors.push({
      field: "message",
      message: "Question message is required",
    });
  } else if (String(message).trim().length < 5) {
    errors.push({
      field: "message",
      message: "Question message must be at least 5 characters long",
    });
  }

  if (errors.length > 0) {
    return next(createError(400, "Validation error", errors));
  }

  return next();
};

const validateAnswerQuestion = (req, res, next) => {
  const { id } = req.params;
  const { message, answeredBy } = req.body;
  const errors = [];

  if (answeredBy !== undefined) {
    errors.push({
      field: "answeredBy",
      message: "answeredBy cannot be sent by the client",
    });
  }

  if (!id || !mongoose.isValidObjectId(id)) {
    errors.push({
      field: "id",
      message: "Question id is invalid",
    });
  }

  if (!message || !String(message).trim()) {
    errors.push({
      field: "message",
      message: "Answer message is required",
    });
  } else if (String(message).trim().length < 5) {
    errors.push({
      field: "message",
      message: "Answer message must be at least 5 characters long",
    });
  }

  if (errors.length > 0) {
    return next(createError(400, "Validation error", errors));
  }

  return next();
};

module.exports = {
  validateCreateQuestion,
  validateAnswerQuestion,
};
