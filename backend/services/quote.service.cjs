// @ts-check
/**
 * Quote Service
 * Business logic for quote operations
 */

const prisma = require("../config/prisma.cjs");

class QuoteService {
  async getNextQuoteNumber(clientId) {
    const last = await prisma.quote.findFirst({
      orderBy: { globalIndex: "desc" },
      select: { globalIndex: true },
    });
    const nextIndex = (last?.globalIndex ?? 99) + 1;

    let customId = "0000";
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: String(clientId) },
        select: { customId: true },
      });
      if (client?.customId) {
        customId = String(client.customId).padStart(4, "0");
      }
    }

    const number = `T-${customId}-${String(nextIndex).padStart(4, "0")}`;
    return { number, index: nextIndex };
  }

  async getAllQuotes() {
    return await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, items: true },
    });
  }

  async getQuoteById(id) {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { client: true, items: true },
    });
    if (!quote) throw new Error("Quote not found");
    return quote;
  }

  async createQuote(data) {
    const {
      items, quoteNumber, clientId, customerReference, salesPerson,
      deliveryDelay, shippingPoint, shippingTerms, comments, remarks,
      tvaRate, totalHt, totalTva, totalTtc, globalIndex, status,
    } = data;

    const itemsCreate = (items ?? [])
      .filter((i) => i.description || i.productRef)
      .map((i, idx) => ({
        productRef: i.productRef ?? "",
        description: i.description ?? "",
        quantity: Number(i.quantity) || 0,
        unitPrice: String(parseFloat(i.unitPrice) || 0),
        totalPrice: String(parseFloat(i.totalPrice) || 0),
        total: String(parseFloat(i.total ?? i.totalPrice) || 0),
        sortOrder: idx,
      }));

    return await prisma.quote.create({
      data: {
        quoteNumber,
        clientId,
        customerReference: customerReference ?? null,
        salesPerson: salesPerson ?? null,
        deliveryDelay: deliveryDelay ?? null,
        shippingPoint: shippingPoint ?? null,
        shippingTerms: shippingTerms ?? null,
        comments: comments ?? null,
        remarks: remarks ?? null,
        tvaRate: tvaRate ? String(parseFloat(tvaRate)) : "20",
        totalHt: totalHt ? String(parseFloat(totalHt)) : "0",
        totalTva: totalTva ? String(parseFloat(totalTva)) : "0",
        totalTtc: totalTtc ? String(parseFloat(totalTtc)) : "0",
        total: totalTtc ? String(parseFloat(totalTtc)) : "0",
        globalIndex: globalIndex ? Number(globalIndex) : null,
        status: status ?? "draft",
        date: new Date(),
        items: itemsCreate.length ? { create: itemsCreate } : undefined,
      },
      include: { client: true, items: true },
    });
  }

  async updateQuote(id, data) {
    const {
      items, quoteNumber, clientId, customerReference, salesPerson,
      deliveryDelay, shippingPoint, shippingTerms, comments, remarks,
      tvaRate, totalHt, totalTva, totalTtc, status,
    } = data;

    const itemsCreate = (items ?? [])
      .filter((i) => i.description || i.productRef)
      .map((i, idx) => ({
        productRef: i.productRef ?? "",
        description: i.description ?? "",
        quantity: Number(i.quantity) || 0,
        unitPrice: String(parseFloat(i.unitPrice) || 0),
        totalPrice: String(parseFloat(i.totalPrice) || 0),
        total: String(parseFloat(i.total ?? i.totalPrice) || 0),
        sortOrder: idx,
      }));

    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });

    return await prisma.quote.update({
      where: { id },
      data: {
        quoteNumber,
        clientId,
        customerReference: customerReference ?? null,
        salesPerson: salesPerson ?? null,
        deliveryDelay: deliveryDelay ?? null,
        shippingPoint: shippingPoint ?? null,
        shippingTerms: shippingTerms ?? null,
        comments: comments ?? null,
        remarks: remarks ?? null,
        tvaRate: tvaRate ? String(parseFloat(tvaRate)) : "20",
        totalHt: totalHt ? String(parseFloat(totalHt)) : "0",
        totalTva: totalTva ? String(parseFloat(totalTva)) : "0",
        totalTtc: totalTtc ? String(parseFloat(totalTtc)) : "0",
        total: totalTtc ? String(parseFloat(totalTtc)) : "0",
        status: status ?? "draft",
        items: itemsCreate.length ? { create: itemsCreate } : undefined,
      },
      include: { client: true, items: true },
    });
  }

  async deleteQuote(id) {
    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    await prisma.quote.delete({ where: { id } });
  }
}

module.exports = new QuoteService();
