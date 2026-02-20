// @ts-check
/**
 * Error Handler Middleware
 * Handles all errors and sends appropriate responses
 */

function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Enregistrement en double" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Enregistrement introuvable" });
  }

  // Validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({ error: err.message || "Requête invalide" });
  }

  // Not authenticated
  if (err.statusCode === 401) {
    return res.status(401).json({ error: err.message || "Non authentifié" });
  }

  // Forbidden
  if (err.statusCode === 403) {
    return res.status(403).json({ error: err.message || "Accès refusé" });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === "development" ? err.message : "Erreur serveur",
  });
}

module.exports = errorHandler;
