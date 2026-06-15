export type RoomType = "living_room" | "bedroom";

export interface ShoppableProduct {
  id: string;
  roomType: RoomType;
  category: string;
  title: string;
  price: number | null;
  currency: string;
  retailer: string;
  affiliateURL: string;
  productURL: string;
  imageURL: string;
  width: number | null;
  depth: number | null;
  height: number | null;
  dimensionUnit: string;
  color: string;
  material: string;
  styleTags: string[];
  visualDescription: string;
  notes: string;
}

export interface RedesignProductInput {
  category: string;
  title: string;
  price?: string;
  retailer: string;
  imageUrl?: string;
  color?: string;
  material?: string;
  dimensions?: string;
  visualDescription?: string;
}

export function displayCategory(product: ShoppableProduct): string {
  return product.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function shortTitle(product: ShoppableProduct): string {
  const pieces = product.title.split(",");
  return (pieces[0] ?? product.title).trim();
}

export function priceText(product: ShoppableProduct): string {
  if (product.price === null) return "Verify price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
    minimumFractionDigits: 2,
  }).format(product.price);
}

export function dimensionsText(product: ShoppableProduct): string {
  const parts = [product.width, product.depth, product.height]
    .filter((v): v is number => v !== null)
    .map((v) => (Number.isInteger(v) ? String(v) : v.toFixed(1)));
  if (parts.length === 0) return "";
  return `${parts.join(" x ")} ${product.dimensionUnit}`;
}

function inferRoomType(roomName: string): RoomType {
  const name = roomName.toLowerCase();
  if (name.includes("bed") || name.includes("master") || name.includes("guest")) {
    return "bedroom";
  }
  return "living_room";
}

function styleAliases(styleId: string): Set<string> {
  switch (styleId) {
    case "minimal":
      return new Set(["minimal", "minimalist", "modern", "neutral"]);
    case "scandinavian":
      return new Set(["scandinavian", "modern", "minimalist", "cozy", "neutral"]);
    case "cozy":
      return new Set(["cozy", "boho", "farmhouse", "neutral"]);
    case "luxe":
      return new Set(["luxe", "luxury", "modern"]);
    case "industrial":
      return new Set(["industrial", "modern"]);
    default:
      return new Set(["modern", "minimalist", "cozy"]);
  }
}

function score(product: ShoppableProduct, aliases: Set<string>): number {
  return product.styleTags.reduce((total, tag) => total + (aliases.has(tag) ? 1 : 0), 0);
}

export function bundleProducts(
  roomName: string,
  styleId: string,
  limit = 12,
): ShoppableProduct[] {
  const roomType = inferRoomType(roomName);
  const aliases = styleAliases(styleId);

  const roomMatches = products.filter(
    (p) => p.roomType === roomType || p.notes.toLowerCase().includes(roomType === "living_room" ? "living room" : "bedroom"),
  );

  const ranked = [...roomMatches].sort((a, b) => score(b, aliases) - score(a, aliases));
  return ranked.slice(0, limit);
}

const GENERATION_CATEGORY_PRIORITY: Record<string, number> = {
  sofa: 0,
  sectional: 0,
  bed_frame: 1,
  rug: 2,
  coffee_table: 3,
  dresser: 4,
  accent_chair: 5,
  nightstand: 6,
  side_table: 7,
  wall_art: 8,
};

function generationPriority(category: string): number {
  return GENERATION_CATEGORY_PRIORITY[category] ?? 50;
}

export function toRedesignProducts(
  products: ShoppableProduct[],
  limit = 8,
): RedesignProductInput[] {
  const seen = new Set<string>();
  const deduped = products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });

  return [...deduped]
    .sort((a, b) => generationPriority(a.category) - generationPriority(b.category))
    .slice(0, limit)
    .map((product) => {
      const dimensions = dimensionsText(product);
      return {
        category: product.category,
        title: product.title,
        price: product.price === null ? undefined : priceText(product),
        retailer: product.retailer,
        imageUrl: product.imageURL || undefined,
        color: product.color || undefined,
        material: product.material || undefined,
        dimensions: dimensions || undefined,
        visualDescription: product.visualDescription || undefined,
      };
    });
}

export const products: ShoppableProduct[] = [
  {
    id: "amazon-linsy-accent-chair-ottoman",
    roomType: "living_room",
    category: "accent_chair",
    title: "LINSY Accent Chair with Ottoman, Modern Barrel Chair Small Armchair Reading Chair with Footrest, Velvet, Cream",
    price: 116.99,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/43tyNvV",
    productURL: "https://www.amazon.com/LINSY-Ottoman-Armchair-Reading-Footrest/dp/B0H2HLN64B",
    imageURL: "https://m.media-amazon.com/images/I/81djaLSUNrL._AC_SL1500_.jpg",
    width: 27.4,
    depth: 25.6,
    height: 26.8,
    dimensionUnit: "in",
    color: "cream",
    material: "velvet",
    styleTags: ["modern", "cozy", "minimalist"],
    visualDescription:
      "A compact cream velvet barrel accent chair with rounded arms, a low curved back, soft upholstered seat, slim black metal legs, and a matching cream ottoman.",
    notes: "Small accent chair with ottoman; Amazon page lists velvet material.",
  },
  {
    id: "amazon-zttriee-round-coffee-table",
    roomType: "living_room",
    category: "coffee_table",
    title: "ZttRiee Coffee Table for Living Room, Modern Round Coffee Table with Cabinets & Sliding Doors, 29.9 Inch Fluted Center Table, Natural",
    price: 139.99,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4vr4oe9",
    productURL: "https://www.amazon.com/ZttRiee-Coffee-Living-Cabinets-Sliding/dp/B0FGPFBSJ8",
    imageURL: "https://m.media-amazon.com/images/I/71ckFGe+tqL._AC_SL1500_.jpg",
    width: 29.9,
    depth: 29.9,
    height: 16.1,
    dimensionUnit: "in",
    color: "oak",
    material: "wood",
    styleTags: ["modern", "boho", "scandinavian"],
    visualDescription:
      "A low round natural-oak coffee table with a fluted cylindrical body, smooth circular top, concealed cabinet storage, and sliding curved doors.",
    notes: "Price should be verified.",
  },
  {
    id: "amazon-vasagle-maezo-side-table",
    roomType: "living_room",
    category: "side_table",
    title: "VASAGLE MAEZO Collection End Table with Charging Station, Narrow Side Table, Nightstand, Honey Brown",
    price: 44.98,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4vaIRWQ",
    productURL: "https://www.amazon.com/VASAGLE-MAEZO-Collection-Transitions-ULET329K101S/dp/B0H28FZH8L",
    imageURL: "https://m.media-amazon.com/images/I/81m9BWEmi7L._AC_SL1500_.jpg",
    width: 18.9,
    depth: 11.8,
    height: 23.6,
    dimensionUnit: "in",
    color: "honey brown",
    material: "particleboard; mdf",
    styleTags: ["mid-century modern", "modern", "cozy"],
    visualDescription:
      "A narrow honey-brown side table with a warm wood-grain finish, simple rectangular frame, open lower shelf, small drawer, and built-in charging station.",
    notes: "Can work for living room or bedroom; includes charging station.",
  },
  {
    id: "amazon-garvee-beige-rug",
    roomType: "living_room",
    category: "rug",
    title: "Garvee Beige 8x10 Area Rug, Boho Vintage Non-Slip Washable Low Pile Rug",
    price: 59.99,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4vbSi8q",
    productURL: "https://www.amazon.com/Garvee-Beige-Non-Slip-Washable-Resistant/dp/B0GHYC8KVH",
    imageURL: "https://m.media-amazon.com/images/I/81z00Wf0N3L._AC_SL1500_.jpg",
    width: 120,
    depth: 96,
    height: null,
    dimensionUnit: "in",
    color: "beige",
    material: "faux wool",
    styleTags: ["boho", "cozy", "minimalist"],
    visualDescription:
      "A large beige low-pile area rug with a soft faux-wool texture, subtle vintage boho patterning, muted cream and tan tones, and a flat rectangular profile.",
    notes: "8 x 10 ft rectangular rug; also suitable for bedroom.",
  },
  {
    id: "amazon-minimalist-boho-wall-art",
    roomType: "living_room",
    category: "wall_art",
    title: "3 Piece Framed Minimalist Boho Canvas Wall Art, Abstract Sage Green Geometric Artwork, 12x16 Inch",
    price: 47.99,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4e9cPoc",
    productURL: "https://www.amazon.com/Minimalist-Bedroom-Abstract-Geometric-Paintings/dp/B0G438R3D3",
    imageURL: "https://m.media-amazon.com/images/I/71ieSd0G8vL._AC_SL1500_.jpg",
    width: 12,
    depth: null,
    height: 16,
    dimensionUnit: "in",
    color: "green white",
    material: "canvas; wood",
    styleTags: ["minimalist", "boho", "scandinavian", "modern"],
    visualDescription:
      "A set of three framed minimalist canvas prints with sage green and white abstract geometric shapes, thin natural frames, and clean modern boho composition.",
    notes: "Set of 3 framed pieces; also suitable for bedroom.",
  },
  {
    id: "amazon-wooden-floral-wall-decor",
    roomType: "living_room",
    category: "wall_art",
    title: "3D Wooden Floral Wall Decor Set of 4, Ready-to-Hang Framed Boho Botanical Wall Art, Naturals",
    price: 39.99,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4e8ejit",
    productURL: "https://www.amazon.com/Wooden-Floral-Bathroom-Lightweight-Bedroom/dp/B0DHW91KK4",
    imageURL: "https://m.media-amazon.com/images/I/81Zgn5eG-5L._AC_SL1500_.jpg",
    width: 7,
    depth: null,
    height: 16,
    dimensionUnit: "in",
    color: "naturals",
    material: "wood",
    styleTags: ["boho", "farmhouse", "cozy", "neutral"],
    visualDescription:
      "A set of four slim natural-wood framed wall panels with raised three-dimensional floral and botanical cutout details in a neutral boho style.",
    notes: "Set of 4; also suitable for bedroom, office, kitchen, or bathroom.",
  },
  {
    id: "amazon-bestier-queen-bed-frame",
    roomType: "bedroom",
    category: "bed_frame",
    title: "Bestier Queen Bed Frame with Adjustable Headboard & LED Lighting, Corduroy Upholstered Platform Bed Frame with Storage Shelf, Beige",
    price: null,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4v1suvA",
    productURL: "https://www.amazon.com/Bestier-Corduroy-Upholstered-Adjustable-Headboard/dp/B0DKXW9QYK",
    imageURL: "https://m.media-amazon.com/images/I/91r51mOPk+L._AC_SL1500_.jpg",
    width: 60.51,
    depth: 83.46,
    height: 39.37,
    dimensionUnit: "in",
    color: "beige",
    material: "corduroy; engineered plywood; foam; wood; metal",
    styleTags: ["modern", "minimalist", "cozy"],
    visualDescription:
      "A beige upholstered queen platform bed with soft corduroy texture, a padded adjustable headboard, integrated storage shelf, clean low-profile frame, and subtle built-in LED lighting.",
    notes: "Queen size; price should be verified.",
  },
  {
    id: "amazon-cozymine-fluted-nightstand",
    roomType: "bedroom",
    category: "nightstand",
    title: "CozyMine Fluted Nightstand with Charging Station, 2 Drawers Storage Bedside Table, Oak",
    price: 109.99,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4xsHnZv",
    productURL: "https://www.amazon.com/Nightstand-Charging-Station-Drawers-Storage/dp/B0G4RJR5B6",
    imageURL: "https://m.media-amazon.com/images/I/81BLj7mPPZL._AC_SL1500_.jpg",
    width: 15.7,
    depth: 18,
    height: 23.6,
    dimensionUnit: "in",
    color: "oak",
    material: "engineered wood; metal; wood",
    styleTags: ["modern", "scandinavian", "cozy"],
    visualDescription:
      "A compact oak fluted nightstand with two drawers, vertical ribbed drawer fronts, rounded modern edges, short legs, and an integrated charging station on top.",
    notes: "Can work as bedroom nightstand or living room end table; includes charging station.",
  },
  {
    id: "amazon-tinge-lira-fabric-dresser",
    roomType: "bedroom",
    category: "dresser",
    title: "tinge Lira Premium 4 Drawer Fabric Dresser, Engineered Wood Frame Chest of Drawers, Dark Brown",
    price: null,
    currency: "USD",
    retailer: "Amazon",
    affiliateURL: "https://amzn.to/4uCVokO",
    productURL: "https://www.amazon.com/Lira-Premium-Fabric-Dresser-Sag-Proof/dp/B0F5Q9WS76",
    imageURL: "https://m.media-amazon.com/images/I/61ZefH2vlqL._AC_SL1500_.jpg",
    width: 23.4,
    depth: 11.8,
    height: 36.5,
    dimensionUnit: "in",
    color: "dark brown",
    material: "engineered wood; fabric; metal",
    styleTags: ["modern", "minimalist", "cozy"],
    visualDescription:
      "A compact dark-brown four-drawer dresser with a simple rectangular silhouette, warm wood-look frame, dark fabric drawer fronts, and slim black metal supports.",
    notes: "4-drawer compact dresser; price should be verified.",
  },
];
