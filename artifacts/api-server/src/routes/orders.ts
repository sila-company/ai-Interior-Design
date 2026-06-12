import { Router } from "express";

const router = Router();

let idCounter = 1;

interface CartItem {
  id: string;
  furnitureItemId: string;
  quantity: number;
  furnitureItem: { price: number };
}

declare const cartItems: CartItem[];

router.post("/", (_req, res) => {
  const order = {
    id: `ORD-${String(idCounter++).padStart(4, "0")}`,
    status: "confirmed",
    totalAmount: 0,
    itemCount: 0,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json(order);
});

export default router;
