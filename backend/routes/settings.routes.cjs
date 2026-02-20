// @ts-check
/**
 * Settings Routes
 */

const express = require("express");
const SettingsController = require("../controllers/settings.controller.cjs");

const router = express.Router();

router.get("/", SettingsController.getSettings.bind(SettingsController));
router.put("/", SettingsController.updateSettings.bind(SettingsController));

module.exports = router;
