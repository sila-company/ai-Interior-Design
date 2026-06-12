import { Router } from "express";
import { CreateProjectBody } from "@workspace/api-zod";

const router = Router();

const mockAiRoomImages = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
];

let idCounter = 1;

router.post("/", (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    return;
  }

  const { photoUri, roomType } = parsed.data;
  const aiRoomImageUrl = mockAiRoomImages[Math.floor(Math.random() * mockAiRoomImages.length)];

  const project = {
    id: String(idCounter++),
    photoUri,
    roomType,
    aiRoomImageUrl,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json(project);
});

export default router;
