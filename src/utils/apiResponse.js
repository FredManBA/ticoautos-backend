class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [];
  }
}

const sendSuccess = (res, { statusCode = 200, message, data = {} }) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

const createError = (statusCode, message, errors = []) =>
  new ApiError(statusCode, message, errors);

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const mapMongooseValidationErrors = (error) => {
  if (error?.name !== "ValidationError") {
    return [];
  }

  return Object.values(error.errors).map((validationError) => ({
    field: validationError.path,
    message: validationError.message,
  }));
};

const mapDuplicateKeyError = (error) => {
  if (error?.code !== 11000) {
    return [];
  }

  const field = Object.keys(error.keyPattern || {})[0] || "field";

  return [
    {
      field,
      message: `${field} already exists`,
    },
  ];
};

module.exports = {
  ApiError,
  sendSuccess,
  createError,
  asyncHandler,
  mapMongooseValidationErrors,
  mapDuplicateKeyError,
};
