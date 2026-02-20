// @ts-check
/**
 * Dashboard Service
 * Business logic for dashboard statistics
 */

const prisma = require("../config/prisma.cjs");

class DashboardService {
  async getDashboardStats() {
    // Dates utiles
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ── Total clients
    const [{ count: totalClients }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM clients`;
    const [{ count: clientsThisMonth }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM clients WHERE created_at >= ${startOfMonth}`;
    const [{ count: clientsLastMonth }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM clients WHERE created_at >= ${startOfLastMonth} AND created_at <= ${endOfLastMonth}`;

    // ── Devis en cours (brouillon + envoyé)
    const [{ count: quotesInProgress }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM quotes WHERE status IN ('draft','sent','pending')`;
    const [{ count: quotesInProgressLastMonth }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM quotes WHERE status IN ('draft','sent','pending') AND created_at >= ${startOfLastMonth} AND created_at <= ${endOfLastMonth}`;
    const [{ count: quotesInProgressThisMonth }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM quotes WHERE status IN ('draft','sent','pending') AND created_at >= ${startOfMonth}`;

    // ── Chiffre d'affaires (devis acceptés total_ttc)
    const [{ total: revenueTotal }] = await prisma.$queryRaw`SELECT COALESCE(SUM(total_ttc::numeric), 0) as total FROM quotes WHERE status = 'accepted'`;
    const [{ total: revenueThisMonth }] = await prisma.$queryRaw`SELECT COALESCE(SUM(total_ttc::numeric), 0) as total FROM quotes WHERE status = 'accepted' AND created_at >= ${startOfMonth}`;
    const [{ total: revenueLastMonth }] = await prisma.$queryRaw`SELECT COALESCE(SUM(total_ttc::numeric), 0) as total FROM quotes WHERE status = 'accepted' AND created_at >= ${startOfLastMonth} AND created_at <= ${endOfLastMonth}`;

    // ── Total devis (tous statuts)
    const [{ count: totalQuotes }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM quotes`;
    const [{ count: quotesThisMonth }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM quotes WHERE created_at >= ${startOfMonth}`;
    const [{ count: quotesLastMonth }] = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM quotes WHERE created_at >= ${startOfLastMonth} AND created_at <= ${endOfLastMonth}`;

    const pct = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      revenue: {
        value: Number(revenueTotal),
        thisMonth: Number(revenueThisMonth),
        lastMonth: Number(revenueLastMonth),
        trend: pct(Number(revenueThisMonth), Number(revenueLastMonth)),
      },
      clients: {
        value: totalClients,
        thisMonth: clientsThisMonth,
        lastMonth: clientsLastMonth,
        trend: pct(clientsThisMonth, clientsLastMonth),
      },
      quotesInProgress: {
        value: quotesInProgress,
        thisMonth: quotesInProgressThisMonth,
        lastMonth: quotesInProgressLastMonth,
        trend: pct(quotesInProgressThisMonth, quotesInProgressLastMonth),
      },
      totalQuotes: {
        value: totalQuotes,
        thisMonth: quotesThisMonth,
        lastMonth: quotesLastMonth,
        trend: pct(quotesThisMonth, quotesLastMonth),
      },
    };
  }
}

module.exports = new DashboardService();
