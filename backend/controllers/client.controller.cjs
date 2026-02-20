// @ts-check
/**
 * Client Controller
 * Handles client HTTP requests
 */

const ClientService = require("../services/client.service.cjs");

class ClientController {
  async getAllClients(req, res, next) {
    try {
      const clients = await ClientService.getAllClients();
      res.json(clients);
    } catch (e) {
      next(e);
    }
  }

  async getClientById(req, res, next) {
    try {
      const client = await ClientService.getClientById(req.params.id);
      res.json(client);
    } catch (e) {
      next(e);
    }
  }

  async createClient(req, res, next) {
    try {
      const client = await ClientService.createClient(req.body);
      res.status(201).json(client);
    } catch (e) {
      next(e);
    }
  }

  async updateClient(req, res, next) {
    try {
      const client = await ClientService.updateClient(req.params.id, req.body);
      res.json(client);
    } catch (e) {
      next(e);
    }
  }

  async deleteClient(req, res, next) {
    try {
      await ClientService.deleteClient(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ClientController();
