// @ts-check
/**
 * Catalog Routes
 */

const express = require("express");
const CatalogController = require("../controllers/catalog.controller.cjs");

const router = express.Router();

router.get("/", CatalogController.getAllCatalogItems.bind(CatalogController));
router.post("/", CatalogController.createCatalogItem.bind(CatalogController));
router.post("/import", CatalogController.importCatalogItems.bind(CatalogController));
router.put("/:id", CatalogController.updateCatalogItem.bind(CatalogController));
router.delete("/:id", CatalogController.deleteCatalogItem.bind(CatalogController));

module.exports = router;
