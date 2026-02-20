// @ts-check
/**
 * Auth Routes
 */

const express = require("express");
const AuthController = require("../controllers/auth.controller.cjs");
const { requireAuth } = require("../middlewares/auth.cjs");

const router = express.Router();

router.post("/login", AuthController.login.bind(AuthController));
router.get("/me", requireAuth, AuthController.getCurrentUser.bind(AuthController));

module.exports = router;
