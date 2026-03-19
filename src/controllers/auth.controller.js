const bcrypt = require("bcryptjs");

const User = require("../models/User");
const sanitizeUser = require("../utils/sanitizeUser");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, createError, asyncHandler } = require("../utils/apiResponse");

const SALT_ROUNDS = 10;

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createError(409, "Email is already registered", [
      { field: "email", message: "Email is already registered" },
    ]);
  }

  const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  const token = generateToken(user);

  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw createError(401, "Invalid credentials", [
      { field: "credentials", message: "Invalid credentials" },
    ]);
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.password);

  if (!isPasswordValid) {
    throw createError(401, "Invalid credentials", [
      { field: "credentials", message: "Invalid credentials" },
    ]);
  }

  const token = generateToken(user);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Login successful",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

module.exports = {
  register,
  login,
};
