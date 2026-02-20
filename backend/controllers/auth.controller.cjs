// @ts-check
/**
 * Auth Controller
 * Handles authentication HTTP requests
 */

const AuthService = require("../services/auth.service.cjs");

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      res.json({ user });
    } catch (e) {
      next(e);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.userId);
      res.json(user);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new AuthController();
