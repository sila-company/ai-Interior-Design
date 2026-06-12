import { Router, type IRouter } from "express";
import multer from "multer";
import { z } from "zod/v4";
import { buildRedesignPrompt, getStyleById } from "../data/styles";
import { generateRoomRedesign } from "../services/openai";

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const createRedesignBodySchema = z.object({
  styleId: z.string().min(1),
});

const redesignResultSchema = z.object({
  styleId: z.string(),
  mimeType: z.string(),
  imageBase64: z.string(),
});

const errorResponseSchema = z.object({
  message: z.string(),
});

router.post("/", upload.single("image"), async (req, res) => {
  const parsedBody = createRedesignBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json(
      errorResponseSchema.parse({ message: "styleId is required." }),
    );
    return;
  }

  if (!req.file) {
    res.status(400).json(
      errorResponseSchema.parse({ message: "image file is required." }),
    );
    return;
  }

  const style = getStyleById(parsedBody.data.styleId);
  if (!style) {
    res.status(400).json(
      errorResponseSchema.parse({ message: `Unknown styleId: ${parsedBody.data.styleId}` }),
    );
    return;
  }

  try {
    const redesigned = await generateRoomRedesign(
      req.file.buffer,
      buildRedesignPrompt(style),
    );

    const data = redesignResultSchema.parse({
      styleId: style.id,
      mimeType: "image/jpeg",
      imageBase64: redesigned.toString("base64"),
    });

    res.status(201).json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate redesign.";
    res.status(502).json(errorResponseSchema.parse({ message }));
  }
});

export default router;
