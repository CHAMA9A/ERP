// @ts-check
/**
 * Activity Log Routes
 */

const express = require("express");
const ActivityLogController = require("../controllers/activity-log.controller.cjs");

const router = express.Router();

router.get("/", ActivityLogController.getActivityLogs.bind(ActivityLogController));
router.post("/", ActivityLogController.logActivity.bind(ActivityLogController));
router.delete("/:id", ActivityLogController.deleteActivityLog.bind(ActivityLogController));
router.delete("/", ActivityLogController.clearAllLogs.bind(ActivityLogController));

module.exports = router;
