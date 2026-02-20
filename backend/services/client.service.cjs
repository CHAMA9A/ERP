// @ts-check
/**
 * Client Service
 * Business logic for client operations
 */

const prisma = require("../config/prisma.cjs");

class ClientService {
  async getAllClients() {
    return await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { quotes: true } } },
    });
  }

  async getClientById(id) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { _count: { select: { quotes: true } } },
    });
    if (!client) throw new Error("Client not found");
    return client;
  }

  async createClient(data) {
    return await prisma.client.create({ data });
  }

  async updateClient(id, data) {
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    if (!client) throw new Error("Client not found");
    return client;
  }

  async deleteClient(id) {
    await prisma.client.delete({ where: { id } });
  }
}

module.exports = new ClientService();
