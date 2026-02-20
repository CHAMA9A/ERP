// @ts-check
/**
 * Events Service
 * Business logic for calendar events operations
 */

const prisma = require("../config/prisma.cjs");

class EventsService {
  async getEvents(filters = {}) {
    const { start, end, userId } = filters;

    let query = `
      SELECT id, title, description, start_at as "startAt", end_at as "endAt",
             all_day as "allDay", color, user_id as "userId", user_name as "userName",
             location, type, created_at as "createdAt"
      FROM calendar_events
      WHERE 1=1
    `;
    const params = [];

    if (start) {
      params.push(start);
      query += ` AND start_at >= $${params.length}::timestamptz`;
    }
    if (end) {
      params.push(end);
      query += ` AND end_at   <= $${params.length}::timestamptz`;
    }
    if (userId) {
      params.push(userId);
      query += ` AND user_id  = $${params.length}::uuid`;
    }

    query += " ORDER BY start_at ASC";

    const events = await prisma.$queryRawUnsafe(query, ...params);
    return events;
  }

  async createEvent(data) {
    const { title, description, startAt, endAt, allDay, color, userId, userName, location, type } = data;

    if (!title) throw new Error("Titre requis");
    if (!startAt || !endAt) throw new Error("Dates requises");

    const rows = await prisma.$queryRaw`
      INSERT INTO calendar_events (title, description, start_at, end_at, all_day, color, user_id, user_name, location, type)
      VALUES (
        ${title},
        ${description ?? null},
        ${new Date(startAt)},
        ${new Date(endAt)},
        ${allDay ?? false},
        ${color ?? '#5B3EFF'},
        ${userId ?? null}::uuid,
        ${userName ?? null},
        ${location ?? null},
        ${type ?? 'event'}
      )
      RETURNING id, title, description, start_at as "startAt", end_at as "endAt",
                all_day as "allDay", color, user_id as "userId", user_name as "userName",
                location, type, created_at as "createdAt"
    `;
    return Array.isArray(rows) ? rows[0] : null;
  }

  async updateEvent(id, data) {
    const { title, description, startAt, endAt, allDay, color, userId, userName, location, type } = data;

    const rows = await prisma.$queryRaw`
      UPDATE calendar_events SET
        title       = ${title},
        description = ${description ?? null},
        start_at    = ${new Date(startAt)},
        end_at      = ${new Date(endAt)},
        all_day     = ${allDay ?? false},
        color       = ${color ?? '#5B3EFF'},
        user_id     = ${userId ?? null}::uuid,
        user_name   = ${userName ?? null},
        location    = ${location ?? null},
        type        = ${type ?? 'event'},
        updated_at  = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, title, description, start_at as "startAt", end_at as "endAt",
                all_day as "allDay", color, user_id as "userId", user_name as "userName",
                location, type, created_at as "createdAt"
    `;
    return Array.isArray(rows) ? rows[0] : null;
  }

  async deleteEvent(id) {
    await prisma.$executeRaw`DELETE FROM calendar_events WHERE id = ${id}::uuid`;
  }
}

module.exports = new EventsService();
