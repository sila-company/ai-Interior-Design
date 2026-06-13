import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import pinoHttp from "pino-http";

import { logger } from "./lib/logger";
import router from "./routes";

const app: Express = express();
const webDistDir = [
  path.resolve(process.cwd(), "../mockup-sandbox/dist"),
  path.resolve(process.cwd(), "artifacts/mockup-sandbox/dist"),
].find((candidate) => existsSync(path.join(candidate, "index.html")));
const webIndexPath = webDistDir ? path.join(webDistDir, "index.html") : null;

app.use(
  pinoHttp({
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
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (webDistDir && webIndexPath) {
  app.use(express.static(webDistDir));
  app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(webIndexPath);
  });
} else {
  logger.warn({ webDistDir }, "Web dist not found; serving API only");
}

export default app;
