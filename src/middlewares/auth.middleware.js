const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

const extractBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token.trim();
};

const authenticate = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      errors: [
        {
          field: "authorization",
          message: "Bearer token is required",
        },
      ],
    });
  }

  try {
    const decodedToken = verifyToken(token);
    const user = await User.findById(decodedToken.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: [
          {
            field: "authorization",
            message: "User associated with token was not found",
          },
        ],
      });
    }

    req.user = user;
    req.auth = decodedToken;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      errors: [
        {
          field: "authorization",
          message: "Provided token is invalid or expired",
        },
      ],
    });
  }
};

module.exports = authenticate;
