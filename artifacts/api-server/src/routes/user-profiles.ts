import { Router } from "express";
import { SaveUserProfileBody } from "@workspace/api-zod";

const router = Router();

let idCounter = 1;

router.post("/", (req, res) => {
  const parsed = SaveUserProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    return;
  }

  const profile = {
    id: String(idCounter++),
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json(profile);
});

export default router;
