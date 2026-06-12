import { Router } from "express";

const router = Router();

const FURNITURE_CATALOG = [
  {
    id: "fi-1",
    name: "Linen Cloud Sofa",
    brand: "Restoration Hardware",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    category: "Seating",
    description: "Deep-seated boucle fabric sofa with solid walnut legs and down cushioning.",
    inStock: true,
  },
  {
    id: "fi-2",
    name: "Travertine Coffee Table",
    brand: "CB2",
    price: 1450,
    imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400",
    category: "Tables",
    description: "Natural travertine stone top with brushed brass frame. Each piece is unique.",
    inStock: true,
  },
  {
    id: "fi-3",
    name: "Arc Floor Lamp",
    brand: "West Elm",
    price: 580,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    category: "Lighting",
    description: "Matte black arched lamp with linen shade. Dimmable with touch control.",
    inStock: true,
  },
  {
    id: "fi-4",
    name: "Bouclé Accent Chair",
    brand: "Article",
    price: 890,
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    category: "Seating",
    description: "Cream bouclé upholstery with black powder-coated steel frame.",
    inStock: true,
  },
  {
    id: "fi-5",
    name: "Japandi Bookshelf",
    brand: "IKEA x HAY",
    price: 720,
    imageUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400",
    category: "Storage",
    description: "Open shelving in white oak with a minimalist Japanese aesthetic.",
    inStock: false,
  },
  {
    id: "fi-6",
    name: "Linen Curtain Set",
    brand: "Parachute",
    price: 340,
    imageUrl: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400",
    category: "Textiles",
    description: "100% Belgian linen panels. 108\" length. Available in Natural and Stone.",
    inStock: true,
  },
  {
    id: "fi-7",
    name: "Organic Wool Rug",
    brand: "Beni Ourain",
    price: 1950,
    imageUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400",
    category: "Textiles",
    description: "Handwoven Moroccan wool rug with geometric patterns. 8×10 ft.",
    inStock: true,
  },
  {
    id: "fi-8",
    name: "Marble Side Table",
    brand: "Menu",
    price: 620,
    imageUrl: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=400",
    category: "Tables",
    description: "White Carrara marble top on a solid brass cylinder base.",
    inStock: true,
  },
];

router.get("/", (_req, res) => {
  res.json(FURNITURE_CATALOG);
});

export default router;
