// @ts-check
/**
 * Client Routes
 */

const express = require("express");
const ClientController = require("../controllers/client.controller.cjs");

const router = express.Router();

router.get("/", ClientController.getAllClients.bind(ClientController));
router.post("/", ClientController.createClient.bind(ClientController));
router.put("/:id", ClientController.updateClient.bind(ClientController));
router.delete("/:id", ClientController.deleteClient.bind(ClientController));

module.exports = router;
