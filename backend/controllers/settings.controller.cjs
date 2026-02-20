// @ts-check
/**
 * Settings Controller
 * Handles settings HTTP requests
 */

const SettingsService = require("../services/settings.service.cjs");

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.getSettings();
      res.json(settings);
    } catch (e) {
      next(e);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      res.json(settings);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new SettingsController();
