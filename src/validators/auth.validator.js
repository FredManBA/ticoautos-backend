const { createError } = require("../utils/apiResponse");

const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  if (!name || !String(name).trim()) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (String(name).trim().length < 3) {
    errors.push({
      field: "name",
      message: "Name must be at least 3 characters long",
    });
  }

  if (!email || !String(email).trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
    errors.push({ field: "email", message: "Email format is invalid" });
  }

  if (!password || !String(password).trim()) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (String(password).length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long",
    });
  }

  if (phone !== undefined && phone !== null && String(phone).trim().length > 30) {
    errors.push({
      field: "phone",
      message: "Phone must not exceed 30 characters",
    });
  }

  if (errors.length > 0) {
    return next(createError(400, "Validation error", errors));
  }

  req.body.name = String(name).trim();
  req.body.email = String(email).trim().toLowerCase();

  if (phone !== undefined && phone !== null) {
    req.body.phone = String(phone).trim();
  }

  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !String(email).trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
    errors.push({ field: "email", message: "Email format is invalid" });
  }

  if (!password || !String(password).trim()) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return next(createError(400, "Validation error", errors));
  }

  req.body.email = String(email).trim().toLowerCase();

  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
