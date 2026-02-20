// @ts-check
/**
 * User Routes
 */

const express = require("express");
const UserController = require("../controllers/user.controller.cjs");

const router = express.Router();

router.get("/", UserController.getAllUsers.bind(UserController));
router.post("/", UserController.createUser.bind(UserController));
router.put("/:id", UserController.updateUser.bind(UserController));
router.delete("/:id", UserController.deleteUser.bind(UserController));

module.exports = router;
