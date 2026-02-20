// @ts-check
/**
 * Dashboard Routes
 */

const express = require("express");
const DashboardController = require("../controllers/dashboard.controller.cjs");

const router = express.Router();

router.get("/stats", DashboardController.getDashboardStats.bind(DashboardController));

module.exports = router;
