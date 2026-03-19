const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const serializedUser =
    typeof user.toJSON === "function" ? user.toJSON() : { ...user };

  delete serializedUser.password;

  return serializedUser;
};

module.exports = sanitizeUser;
