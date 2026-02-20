// @ts-check
/**
 * Auth Service
 * Business logic for authentication operations
 */

const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma.cjs");

class AuthService {
  async login(email, password) {
    if (!email || !password) throw new Error("Email et mot de passe requis");

    const rows = await prisma.$queryRaw`
      SELECT p.id, p.first_name as "firstName", p.last_name as "lastName",
             p.email, p.role, p.status,
             uc.password_hash as "passwordHash"
      FROM profiles p
      JOIN user_credentials uc ON uc.profile_id = p.id
      WHERE p.email = ${email}
      LIMIT 1
    `;
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) throw new Error("Email ou mot de passe incorrect");
    if (user.status === "inactive") throw new Error("Compte désactivé");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Email ou mot de passe incorrect");

    // Log activity
    await prisma.$executeRaw`
      INSERT INTO activity_log (user_id, user_name, action, module)
      VALUES (${user.id}::uuid, ${user.firstName + " " + user.lastName}, ${"Connexion"}, ${"Auth"})
    `;

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async getCurrentUser(userId) {
    const rows = await prisma.$queryRaw`
      SELECT id, first_name as "firstName", last_name as "lastName",
             email, role, status
      FROM profiles WHERE id = ${userId}::uuid LIMIT 1
    `;
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) throw new Error("User not found");
    return user;
  }
}

module.exports = new AuthService();
