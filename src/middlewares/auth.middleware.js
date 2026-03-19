const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");
const { createError, asyncHandler } = require("../utils/apiResponse");

const extractBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token.trim();
};

const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw createError(401, "Authentication required", [
      {
        field: "authorization",
        message: "Bearer token is required",
      },
    ]);
  }

  try {
    const decodedToken = verifyToken(token);
    const user = await User.findById(decodedToken.sub);

    if (!user) {
      throw createError(401, "Authentication required", [
        {
          field: "authorization",
          message: "User associated with token was not found",
        },
      ]);
    }

    req.user = user;
    req.auth = decodedToken;

    return next();
  } catch (error) {
    throw createError(401, "Invalid or expired token", [
      {
        field: "authorization",
        message: "Provided token is invalid or expired",
      },
    ]);
  }
});

module.exports = authenticate;
