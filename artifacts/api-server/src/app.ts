import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import pinoHttp from "pino-http";

import { logger } from "./lib/logger";
import router from "./routes";
import { stripeWebhookHandler } from "./routes/stripe";

const app: Express = express();
const webDistDir = [
  path.resolve(process.cwd(), "../mockup-sandbox/dist"),
  path.resolve(process.cwd(), "artifacts/mockup-sandbox/dist"),
].find((candidate) => existsSync(path.join(candidate, "index.html")));
const webIndexPath = webDistDir ? path.join(webDistDir, "index.html") : null;
const isProduction = process.env.NODE_ENV === "production";

function sendHealthResponse(res: Response): void {
  res.json({ status: "ok" });
}

function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      {
        req: {
          method: req.method,
          url: req.url?.split("?")[0],
        },
        res: { statusCode: res.statusCode },
        responseTime: Date.now() - start,
      },
      "request completed",
    );
  });
  next();
}

app.use(
  isProduction
    ? requestLoggingMiddleware
    : pinoHttp({
        logger,
        serializers: {
          req(req) {
            return {
              id: req.id,
              method: req.method,
              url: req.url?.split("?")[0],
            };
          },
          res(res) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      }),
);
const allowedOrigins: (string | RegExp)[] = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => allowedOrigins.push(o));
}
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);
app.use(cookieParser());
// Stripe webhook needs the raw body for signature verification — register
// express.raw() for that path BEFORE the global express.json() middleware.
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Replit artifact routing strips the /api prefix before forwarding to port 8080,
// so external GET /api and GET /api/healthz arrive here as GET / and GET /healthz.
app.get(["/healthz", "/api", "/api/"], (_req, res) => {
  sendHealthResponse(res);
});

app.get("/", (req, res, next) => {
  if (webDistDir) {
    next();
    return;
  }

  sendHealthResponse(res);
});

app.use("/api", router);

if (webDistDir && webIndexPath) {
  app.use(express.static(webDistDir));
  app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(webIndexPath);
  });
} else {
  logger.warn("Web dist not found; serving API only");
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled request error");
  if (!res.headersSent) {
    res.status(500).json({ message: "Internal server error." });
  }
});

export default app;
