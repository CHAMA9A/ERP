// @ts-check
/**
 * Events Controller
 * Handles calendar events HTTP requests
 */

const EventsService = require("../services/events.service.cjs");

class EventsController {
  async getEvents(req, res, next) {
    try {
      const events = await EventsService.getEvents(req.query);
      res.json(events);
    } catch (e) {
      next(e);
    }
  }

  async createEvent(req, res, next) {
    try {
      const event = await EventsService.createEvent(req.body);
      res.status(201).json(event);
    } catch (e) {
      next(e);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const event = await EventsService.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (e) {
      next(e);
    }
  }

  async deleteEvent(req, res, next) {
    try {
      await EventsService.deleteEvent(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new EventsController();
