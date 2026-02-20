// @ts-check
/**
 * User Service
 * Business logic for user operations
 */

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/prisma.cjs");

class UserService {
  async getAllUsers() {
    const users = await prisma.$queryRaw`
      SELECT id, email, full_name as "fullName", first_name as "firstName", 
             last_name as "lastName", role, status, created_at as "createdAt"
      FROM profiles
      ORDER BY created_at DESC
    `;
    return users;
  }

  async getUserById(id) {
    const rows = await prisma.$queryRaw`
      SELECT id, email, full_name as "fullName", first_name as "firstName", 
             last_name as "lastName", role, status, created_at as "createdAt"
      FROM profiles WHERE id = ${id}::uuid LIMIT 1
    `;
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) throw new Error("User not found");
    return user;
  }

  async createUser(data) {
    const { firstName, lastName, email, password, role, status } = data;
    if (!email) throw new Error("Email requis");

    const fullName = [firstName, lastName].filter(Boolean).join(" ") || email;
    const userId = crypto.randomUUID();

    await prisma.$executeRaw`
      INSERT INTO profiles (id, email, full_name, first_name, last_name, role, status, created_at)
      VALUES (${userId}::uuid, ${email}, ${fullName}, ${firstName ?? null}, ${lastName ?? null}, 
              ${role ?? "commercial"}, ${status ?? "active"}, NOW())
    `;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await prisma.$executeRaw`
        INSERT INTO user_credentials (profile_id, password_hash)
        VALUES (${userId}::uuid, ${hash})
      `;
    }

    const rows = await prisma.$queryRaw`
      SELECT id, email, full_name as "fullName", first_name as "firstName", 
             last_name as "lastName", role, status, created_at as "createdAt"
      FROM profiles WHERE id = ${userId}::uuid
    `;
    return Array.isArray(rows) ? rows[0] : null;
  }

  async updateUser(id, data) {
    const { firstName, lastName, email, role, status, password } = data;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    await prisma.$executeRaw`
      UPDATE profiles SET
        first_name = ${firstName ?? null},
        last_name = ${lastName ?? null},
        full_name = ${fullName || null},
        email = ${email ?? null},
        role = ${role ?? null},
        status = ${status ?? null}
      WHERE id = ${id}::uuid
    `;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      const existing = await prisma.$queryRaw`SELECT id FROM user_credentials WHERE profile_id = ${id}::uuid`;
      if (Array.isArray(existing) && existing.length > 0) {
        await prisma.$executeRaw`UPDATE user_credentials SET password_hash = ${hash} WHERE profile_id = ${id}::uuid`;
      } else {
        await prisma.$executeRaw`INSERT INTO user_credentials (profile_id, password_hash) VALUES (${id}::uuid, ${hash})`;
      }
    }

    const rows = await prisma.$queryRaw`
      SELECT id, email, full_name as "fullName", first_name as "firstName", 
             last_name as "lastName", role, status, created_at as "createdAt"
      FROM profiles WHERE id = ${id}::uuid
    `;
    return Array.isArray(rows) ? rows[0] : null;
  }

  async deleteUser(id) {
    await prisma.$executeRaw`DELETE FROM user_credentials WHERE profile_id = ${id}::uuid`;
    await prisma.$executeRaw`DELETE FROM profiles WHERE id = ${id}::uuid`;
  }
}

module.exports = new UserService();
