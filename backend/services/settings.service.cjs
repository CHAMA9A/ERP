// @ts-check
/**
 * Settings Service
 * Business logic for company settings operations
 */

const prisma = require("../config/prisma.cjs");

class SettingsService {
  async getSettings() {
    const settings = await prisma.companySettings.findFirst();
    if (!settings) return {};

    const raw = await prisma.$queryRaw`
      SELECT siren, tva_number as "tvaNumber", payment_method as "paymentMethod" 
      FROM company_settings WHERE id = ${settings.id}::uuid
    `;
    return { ...settings, ...(Array.isArray(raw) ? raw[0] : {}) };
  }

  async updateSettings(data) {
    const {
      name, address, phone, email, logoUrl,
      legalNotesDefault, defaultTva, siren, tvaNumber, paymentMethod,
    } = data;

    const existing = await prisma.companySettings.findFirst();

    if (existing) {
      await prisma.$executeRaw`
        UPDATE company_settings SET
          name = ${name ?? null},
          address = ${address ?? null},
          phone = ${phone ?? null},
          email = ${email ?? null},
          logo_url = ${logoUrl ?? null},
          legal_notes_default = ${legalNotesDefault ?? null},
          default_tva = ${defaultTva ? parseFloat(defaultTva) : null},
          siren = ${siren ?? null},
          tva_number = ${tvaNumber ?? null},
          payment_method = ${paymentMethod ?? null},
          updated_at = NOW()
        WHERE id = ${existing.id}::uuid
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO company_settings (
          id, name, address, phone, email, logo_url, legal_notes_default, 
          default_tva, siren, tva_number, payment_method, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), ${name ?? null}, ${address ?? null}, ${phone ?? null}, 
          ${email ?? null}, ${logoUrl ?? null}, ${legalNotesDefault ?? null}, 
          ${defaultTva ? parseFloat(defaultTva) : null}, ${siren ?? null}, 
          ${tvaNumber ?? null}, ${paymentMethod ?? null}, NOW(), NOW()
        )
      `;
    }

    return await this.getSettings();
  }
}

module.exports = new SettingsService();
