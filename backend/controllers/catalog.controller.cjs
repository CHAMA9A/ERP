// @ts-check
/**
 * Catalog Controller
 * Handles catalog HTTP requests
 */

const CatalogService = require("../services/catalog.service.cjs");

class CatalogController {
  async getAllCatalogItems(req, res, next) {
    try {
      const items = await CatalogService.getAllCatalogItems();
      res.json(items);
    } catch (e) {
      next(e);
    }
  }

  async getCatalogItemById(req, res, next) {
    try {
      const item = await CatalogService.getCatalogItemById(req.params.id);
      res.json(item);
    } catch (e) {
      next(e);
    }
  }

  async createCatalogItem(req, res, next) {
    try {
      const item = await CatalogService.createCatalogItem(req.body);
      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  }

  async updateCatalogItem(req, res, next) {
    try {
      const item = await CatalogService.updateCatalogItem(req.params.id, req.body);
      res.json(item);
    } catch (e) {
      next(e);
    }
  }

  async deleteCatalogItem(req, res, next) {
    try {
      await CatalogService.deleteCatalogItem(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }

  async importCatalogItems(req, res, next) {
    try {
      const result = await CatalogService.importCatalogItems(req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new CatalogController();
