// @ts-check
/**
 * Events Routes
 */

const express = require("express");
const EventsController = require("../controllers/events.controller.cjs");

const router = express.Router();

router.get("/", EventsController.getEvents.bind(EventsController));
router.post("/", EventsController.createEvent.bind(EventsController));
router.put("/:id", EventsController.updateEvent.bind(EventsController));
router.delete("/:id", EventsController.deleteEvent.bind(EventsController));

module.exports = router;
