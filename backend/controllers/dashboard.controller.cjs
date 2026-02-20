// @ts-check
/**
 * Dashboard Controller
 * Handles dashboard HTTP requests
 */

const DashboardService = require("../services/dashboard.service.cjs");

class DashboardController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await DashboardService.getDashboardStats();
      res.json(stats);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new DashboardController();
