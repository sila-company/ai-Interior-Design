import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { getDb, users } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/healthz/deep", async (_req, res) => {
  const checks = {
    databaseUrl: Boolean(process.env.DATABASE_URL),
    jwtSecret: Boolean(process.env.JWT_SECRET),
    openAIAPIKey: Boolean(process.env.OPENAI_API_KEY),
    database: false,
  };

  try {
    const db = getDb();
    await db.select({ id: users.id }).from(users).limit(1);
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const ok = Object.values(checks).every(Boolean);
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    checks,
  });
});

export default router;
