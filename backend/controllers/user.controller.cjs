// @ts-check
/**
 * User Controller
 * Handles user HTTP requests
 */

const UserService = require("../services/user.service.cjs");

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await UserService.deleteUser(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
