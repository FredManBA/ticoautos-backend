const bcrypt = require("bcryptjs");

const User = require("../models/User");
const sanitizeUser = require("../utils/sanitizeUser");
const { generateToken } = require("../utils/jwt");

const SALT_ROUNDS = 10;

const formatErrors = (errors) =>
  errors.map((error) => ({
    field: error.field,
    message: error.message,
  }));

const getValidationErrors = (error) => {
  if (error.name === "ValidationError") {
    return Object.values(error.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message,
    }));
  }

  if (error.code === 11000) {
    return [
      {
        field: Object.keys(error.keyPattern || {})[0] || "email",
        message: "Email is already registered",
      },
    ];
  }

  return [];
};

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  if (!name || !String(name).trim()) {
    errors.push({ field: "name", message: "Name is required" });
  }

  if (!email || !String(email).trim()) {
    errors.push({ field: "email", message: "Email is required" });
  }

  if (!password || !String(password).trim()) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (String(password).length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: formatErrors(errors),
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
        errors: [{ field: "email", message: "Email is already registered" }],
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    const validationErrors = getValidationErrors(error);

    if (validationErrors.length > 0) {
      return res.status(error.code === 11000 ? 409 : 400).json({
        success: false,
        message: "Validation error",
        errors: formatErrors(validationErrors),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !String(email).trim()) {
    errors.push({ field: "email", message: "Email is required" });
  }

  if (!password || !String(password).trim()) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: formatErrors(errors),
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        errors: [{ field: "credentials", message: "Invalid credentials" }],
      });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        errors: [{ field: "credentials", message: "Invalid credentials" }],
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

module.exports = {
  register,
  login,
};
