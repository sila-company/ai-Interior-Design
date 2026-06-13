import { Router, type IRouter } from "express";
import path from "node:path";

import type { AuthenticatedRequest } from "../middlewares/auth";
import { requireAuth } from "../middlewares/auth";
import { readStoredImage } from "../services/storage";

const router: IRouter = Router();

router.use(requireAuth);

router.get(/.*/, async (req: AuthenticatedRequest, res) => {
  const relativePath = req.path.replace(/^\//, "");
  if (!relativePath) {
    res.status(400).json({ message: "File path is required." });
    return;
  }

  if (!relativePath.startsWith(`${req.user!.id}/`)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const extension = path.extname(relativePath).toLowerCase();
  const contentType =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : "image/jpeg";

  try {
    const buffer = await readStoredImage(relativePath);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(buffer);
  } catch {
    res.status(404).json({ message: "File not found." });
  }
});

export default router;
