// @ts-check
/**
 * Activity Log Service
 * Business logic for activity logging operations
 */

const prisma = require("../config/prisma.cjs");

class ActivityLogService {
  async getActivityLogs(filters = {}) {
    const { sortBy = "date", sortDir = "desc", filterUser = "", filterAction = "" } = filters;

    const validCols = { date: "created_at", action: "action", user: "user_name" };
    const col = validCols[sortBy] ?? "created_at";
    const dir = String(sortDir).toLowerCase() === "asc" ? "ASC" : "DESC";

    let query = `
      SELECT id, user_id as "userId", user_name as "userName", action, module, created_at as "createdAt" 
      FROM activity_log WHERE 1=1
    `;
    const params = [];

    if (filterUser) {
      params.push(`%${filterUser}%`);
      query += ` AND LOWER(user_name) LIKE LOWER($${params.length})`;
    }
    if (filterAction) {
      params.push(`%${filterAction}%`);
      query += ` AND LOWER(action) LIKE LOWER($${params.length})`;
    }

    query += ` ORDER BY ${col} ${dir} LIMIT 100`;

    const logs = await prisma.$queryRawUnsafe(query, ...params);
    return logs;
  }

  async logActivity(data) {
    const { userId, userName, action, module } = data;
    if (!action) throw new Error("Action requise");

    await prisma.$executeRaw`
      INSERT INTO activity_log (user_id, user_name, action, module)
      VALUES (${userId ?? null}::uuid, ${userName ?? null}, ${action}, ${module ?? null})
    `;
  }

  async deleteActivityLog(id) {
    await prisma.$executeRaw`DELETE FROM activity_log WHERE id = ${id}::uuid`;
  }

  async clearAllLogs() {
    await prisma.$executeRaw`DELETE FROM activity_log`;
  }
}

module.exports = new ActivityLogService();
