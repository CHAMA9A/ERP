// @ts-check
/**
 * Authentication Middleware
 * Validates user ID from x-user-id header
 */

function requireAuth(req, res, next) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    const err = new Error("Non authentifié");
    err.statusCode = 401;
    return next(err);
  }
  req.userId = userId;
  next();
}

module.exports = {
  requireAuth,
};
