import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/healthz/deep", async (_req, res) => {
  const checks = {
    databaseUrl: Boolean(process.env.DATABASE_URL),
    jwtSecret: Boolean(process.env.JWT_SECRET),
    openAIAPIKey: Boolean(process.env.OPENAI_API_KEY),
    database: false,
  };

  try {
    const { getDb, users } = await import("@workspace/db");
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
