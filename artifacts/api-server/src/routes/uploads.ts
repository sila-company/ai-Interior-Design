import { Router, type IRouter } from "express";
import { createReadStream } from "node:fs";
import path from "node:path";

import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";
import { resolveUploadAbsolutePath } from "../services/storage";

const router: IRouter = Router();

router.use(requireAuth);

router.get(/.*/, (req: AuthenticatedRequest, res) => {
  const relativePath = req.path.replace(/^\//, "");
  if (!relativePath) {
    res.status(400).json({ message: "File path is required." });
    return;
  }

  if (!relativePath.startsWith(`${req.user!.id}/`)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const absolutePath = resolveUploadAbsolutePath(relativePath);
  const extension = path.extname(absolutePath).toLowerCase();
  const contentType =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : "image/jpeg";

  res.setHeader("Content-Type", contentType);
  createReadStream(absolutePath)
    .on("error", () => {
      res.status(404).json({ message: "File not found." });
    })
    .pipe(res);
});

export default router;
