// @ts-check
/**
 * Catalog Service
 * Business logic for catalog operations
 */

const prisma = require("../config/prisma.cjs");

class CatalogService {
  async getAllCatalogItems() {
    return await prisma.catalogItem.findMany({ orderBy: { name: "asc" } });
  }

  async getCatalogItemById(id) {
    const item = await prisma.catalogItem.findUnique({ where: { id } });
    if (!item) throw new Error("Catalog item not found");
    return item;
  }

  async createCatalogItem(data) {
    return await prisma.catalogItem.create({ data });
  }

  async updateCatalogItem(id, data) {
    const item = await prisma.catalogItem.update({
      where: { id },
      data,
    });
    if (!item) throw new Error("Catalog item not found");
    return item;
  }

  async deleteCatalogItem(id) {
    await prisma.catalogItem.delete({ where: { id } });
  }

  async importCatalogItems(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Aucune donnée");
    }

    const created = [];
    for (const row of rows) {
      if (!row.name) continue;

      // Sanitize unitPrice: strip non-numeric chars (comma → dot), fallback to "0"
      const rawPrice = String(row.unitPrice ?? "0").replace(",", ".");
      const parsedPrice = parseFloat(rawPrice);
      const unitPrice = isNaN(parsedPrice) ? "0" : String(parsedPrice);

      const item = await prisma.catalogItem.create({
        data: {
          reference: row.reference ?? "",
          name: row.name,
          description: row.description ?? "",
          unitPrice,
        },
      });
      created.push(item);
    }

    return { count: created.length, items: created };
  }
}

module.exports = new CatalogService();
