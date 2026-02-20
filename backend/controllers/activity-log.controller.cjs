// @ts-check
/**
 * Activity Log Controller
 * Handles activity log HTTP requests
 */

const ActivityLogService = require("../services/activity-log.service.cjs");

class ActivityLogController {
  async getActivityLogs(req, res, next) {
    try {
      const logs = await ActivityLogService.getActivityLogs(req.query);
      res.json(logs);
    } catch (e) {
      next(e);
    }
  }

  async logActivity(req, res, next) {
    try {
      await ActivityLogService.logActivity(req.body);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }

  async deleteActivityLog(req, res, next) {
    try {
      await ActivityLogService.deleteActivityLog(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }

  async clearAllLogs(req, res, next) {
    try {
      await ActivityLogService.clearAllLogs();
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ActivityLogController();
