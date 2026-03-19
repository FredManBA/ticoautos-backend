const mongoose = require("mongoose");

const buildVehicleFilters = require("../utils/buildVehicleFilters");

const ALLOWED_BODY_FIELDS = [
  "brand",
  "model",
  "year",
  "price",
  "description",
  "mileage",
  "color",
  "transmission",
  "fuelType",
  "location",
  "images",
];

const sendValidationError = (res, errors, message = "Validation error") =>
  res.status(400).json({
    success: false,
    message,
    errors,
  });

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch (error) {
    return false;
  }
};

const validateVehicleIdParam = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle id",
      errors: [{ field: "id", message: "Vehicle id is invalid" }],
    });
  }

  return next();
};

const validateVehicleListQuery = (req, res, next) => {
  const result = buildVehicleFilters(req.query);

  if (result.errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle filters",
      errors: result.errors,
    });
  }

  req.vehicleListOptions = result;
  return next();
};

const validateVehiclePayload = (payload, { partial = false } = {}) => {
  const errors = [];

  if ("owner" in payload) {
    errors.push({
      field: "owner",
      message: "owner cannot be sent by the client",
    });
  }

  if ("status" in payload) {
    errors.push({
      field: "status",
      message: "status cannot be updated from this endpoint",
    });
  }

  if (!partial) {
    for (const field of ["brand", "model", "year", "price", "description"]) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        errors.push({
          field,
          message: `${field} is required`,
        });
      }
    }
  }

  if (partial) {
    const presentAllowedFields = ALLOWED_BODY_FIELDS.filter(
      (field) => payload[field] !== undefined
    );

    if (presentAllowedFields.length === 0) {
      errors.push({
        field: "body",
        message: "At least one editable vehicle field is required",
      });
    }
  }

  if (payload.year !== undefined && (!Number.isInteger(Number(payload.year)) || Number(payload.year) < 1900)) {
    errors.push({
      field: "year",
      message: "year must be a valid integer greater than or equal to 1900",
    });
  }

  if (payload.price !== undefined && (Number.isNaN(Number(payload.price)) || Number(payload.price) <= 0)) {
    errors.push({
      field: "price",
      message: "price must be greater than 0",
    });
  }

  if (payload.mileage !== undefined && (Number.isNaN(Number(payload.mileage)) || Number(payload.mileage) < 0)) {
    errors.push({
      field: "mileage",
      message: "mileage cannot be negative",
    });
  }

  if (
    payload.transmission !== undefined &&
    !["manual", "automatic"].includes(String(payload.transmission))
  ) {
    errors.push({
      field: "transmission",
      message: "transmission must be manual or automatic",
    });
  }

  if (
    payload.fuelType !== undefined &&
    !["gasoline", "diesel", "hybrid", "electric"].includes(
      String(payload.fuelType)
    )
  ) {
    errors.push({
      field: "fuelType",
      message: "fuelType is invalid",
    });
  }

  if (payload.images !== undefined) {
    if (!Array.isArray(payload.images)) {
      errors.push({
        field: "images",
        message: "images must be an array of URLs",
      });
    } else if (!payload.images.every((image) => typeof image === "string" && isValidUrl(image))) {
      errors.push({
        field: "images",
        message: "All images must be valid URLs",
      });
    }
  }

  return errors;
};

const validateCreateVehicle = (req, res, next) => {
  const errors = validateVehiclePayload(req.body, { partial: false });

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
};

const validateUpdateVehicle = (req, res, next) => {
  const errors = validateVehiclePayload(req.body, { partial: true });

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
};

module.exports = {
  validateVehicleIdParam,
  validateVehicleListQuery,
  validateCreateVehicle,
  validateUpdateVehicle,
};
