import { Router } from "express";
import { AddCartItemBody } from "@workspace/api-zod";

const router = Router();

const FURNITURE_CATALOG: Record<string, object> = {
  "fi-1": { id: "fi-1", name: "Linen Cloud Sofa", brand: "Restoration Hardware", price: 3200, imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", category: "Seating", description: "Deep-seated boucle fabric sofa with solid walnut legs.", inStock: true },
  "fi-2": { id: "fi-2", name: "Travertine Coffee Table", brand: "CB2", price: 1450, imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400", category: "Tables", description: "Natural travertine stone top with brushed brass frame.", inStock: true },
  "fi-3": { id: "fi-3", name: "Arc Floor Lamp", brand: "West Elm", price: 580, imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", category: "Lighting", description: "Matte black arched lamp with linen shade.", inStock: true },
  "fi-4": { id: "fi-4", name: "Bouclé Accent Chair", brand: "Article", price: 890, imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400", category: "Seating", description: "Cream bouclé upholstery with black steel frame.", inStock: true },
  "fi-5": { id: "fi-5", name: "Japandi Bookshelf", brand: "IKEA x HAY", price: 720, imageUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400", category: "Storage", description: "Open shelving in white oak.", inStock: false },
  "fi-6": { id: "fi-6", name: "Linen Curtain Set", brand: "Parachute", price: 340, imageUrl: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400", category: "Textiles", description: "100% Belgian linen panels.", inStock: true },
  "fi-7": { id: "fi-7", name: "Organic Wool Rug", brand: "Beni Ourain", price: 1950, imageUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400", category: "Textiles", description: "Handwoven Moroccan wool rug.", inStock: true },
  "fi-8": { id: "fi-8", name: "Marble Side Table", brand: "Menu", price: 620, imageUrl: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=400", category: "Tables", description: "White Carrara marble top on a brass base.", inStock: true },
};

interface CartItem {
  id: string;
  furnitureItemId: string;
  quantity: number;
  furnitureItem: object;
}

let cartItems: CartItem[] = [];
let idCounter = 1;

router.get("/", (_req, res) => {
  res.json(cartItems);
});

router.post("/", (req, res) => {
  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    return;
  }

  const { furnitureItemId, quantity } = parsed.data;
  const furnitureItem = FURNITURE_CATALOG[furnitureItemId];
  if (!furnitureItem) {
    res.status(404).json({ error: "Furniture item not found" });
    return;
  }

  const existing = cartItems.find((c) => c.furnitureItemId === furnitureItemId);
  if (existing) {
    existing.quantity += quantity;
    res.status(201).json(existing);
    return;
  }

  const cartItem: CartItem = {
    id: String(idCounter++),
    furnitureItemId,
    quantity,
    furnitureItem,
  };
  cartItems.push(cartItem);
  res.status(201).json(cartItem);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  cartItems = cartItems.filter((c) => c.id !== id);
  res.json({ success: true });
});

export default router;
