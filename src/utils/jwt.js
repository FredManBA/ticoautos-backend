const jwt = require("jsonwebtoken");

const env = require("../config/env");

const generateToken = (user) =>
  jwt.sign(
    {
      email: user.email,
      name: user.name,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      subject: user._id.toString(),
    }
  );

const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = {
  generateToken,
  verifyToken,
};
