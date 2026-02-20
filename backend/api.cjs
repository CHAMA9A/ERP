// @ts-check
/**
 * Express.js + Prisma Backend API
 * Professional SaaS Architecture
 * 
 * Structure:
 * - Routes: server/routes/
 * - Controllers: server/controllers/
 * - Services: server/services/
 * - Config: server/config/
 * - Middlewares: server/middlewares/
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUiDist = require("swagger-ui-dist").getAbsoluteFSPath();

// ──── CONFIG ────────────────────────────────────────────────────────────────
const prisma = require("./config/prisma.cjs");

// ──── MIDDLEWARES ───────────────────────────────────────────────────────────
const errorHandler = require("./middlewares/errorHandler.cjs");

// ──── ROUTES ────────────────────────────────────────────────────────────────
const clientRoutes = require("./routes/client.routes.cjs");
const quoteRoutes = require("./routes/quote.routes.cjs");
const catalogRoutes = require("./routes/catalog.routes.cjs");
const userRoutes = require("./routes/user.routes.cjs");
const authRoutes = require("./routes/auth.routes.cjs");
const settingsRoutes = require("./routes/settings.routes.cjs");
const activityLogRoutes = require("./routes/activity-log.routes.cjs");
const eventsRoutes = require("./routes/events.routes.cjs");
const dashboardRoutes = require("./routes/dashboard.routes.cjs");

// ──── CREATE EXPRESS APP ────────────────────────────────────────────────────
const app = express();

// ──── SETUP SWAGGER ─────────────────────────────────────────────────────────
let swaggerSpec;
try {
  swaggerSpec = require("./swagger.cjs");
  console.log("✓ Swagger spec loaded successfully");
} catch (error) {
  console.error("✗ Error loading swagger.cjs:", error.message);
  swaggerSpec = {
    openapi: "3.0.0",
    info: { title: "RIZAT ERP API", version: "1.0.0" },
    paths: {},
  };
}


// ──── CORS & BODY PARSER ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ──── SWAGGER ENDPOINTS ─────────────────────────────────────────────────────
app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

app.use("/api-docs", express.static(swaggerUiDist));

app.get("/api-docs", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>RIZAT ERP API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    // SwaggerUIBundle({
    //   url: "/swagger.json",
    //   dom_id: "#swagger-ui"
    // });
  </script>
</body>
</html>
  `);
});

// ──── ROOT ENDPOINT ────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "RIZAT ERP API v1",
    endpoints: {
      clients: "/api/clients",
      quotes: "/api/quotes",
      catalog: "/api/catalog",
      users: "/api/users",
      auth: "/api/auth",
      settings: "/api/settings",
      activityLog: "/api/activity-log",
      events: "/api/events",
      dashboard: "/api/dashboard",
      docs: "/api-docs",
    },
  });
});

// ──── REGISTER ROUTES ───────────────────────────────────────────────────────
app.use("/api/clients", clientRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/activity-log", activityLogRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ──── 404 HANDLER ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ──── ERROR HANDLER MIDDLEWARE ──────────────────────────────────────────────
app.use(errorHandler);

// ──── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// ──── START SERVER ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ API server running on http://localhost:${PORT}`);
  console.log(`✓ API docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
