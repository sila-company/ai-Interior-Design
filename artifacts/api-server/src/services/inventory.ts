import { eq, sql } from "drizzle-orm";

import { getDb, products, type rooms } from "@workspace/db";
import { seedProducts } from "../data/product-seed";

type RoomRecord = typeof rooms.$inferSelect;

export interface InventoryProduct {
  id: string;
  roomType: string;
  category: string;
  title: string;
  price?: string;
  currency: string;
  retailer: string;
  affiliateUrl: string;
  productUrl: string;
  imageUrl?: string;
  width?: number;
  depth?: number;
  height?: number;
  dimensionUnit: string;
  color?: string;
  material?: string;
  styleTags: string[];
  dimensions?: string;
  visualDescription?: string;
}

const PRODUCT_LIMIT = 12;

const ROOM_CATEGORY_ALLOWLIST: Record<string, Set<string>> = {
  bedroom: new Set(["bed_frame", "nightstand", "dresser", "rug", "wall_art"]),
  living_room: new Set([
    "sofa",
    "accent_chair",
    "coffee_table",
    "side_table",
    "rug",
    "wall_art",
  ]),
};

const CATEGORY_PRIORITY: Record<string, number> = {
  sofa: 0,
  bed_frame: 0,
  rug: 1,
  coffee_table: 2,
  dresser: 2,
  accent_chair: 3,
  nightstand: 3,
  side_table: 4,
  wall_art: 5,
};

const STYLE_ALIASES: Record<string, Set<string>> = {
  modern: new Set(["modern", "minimalist", "scandinavian", "cozy"]),
  minimal: new Set(["minimal", "minimalist", "modern", "neutral"]),
  scandinavian: new Set(["scandinavian", "modern", "minimalist", "cozy", "neutral"]),
  cozy: new Set(["cozy", "boho", "farmhouse", "neutral"]),
  luxe: new Set(["luxe", "luxury", "modern"]),
  industrial: new Set(["industrial", "modern"]),
};

let inventoryReady: Promise<void> | null = null;

export async function ensureInventoryDatabase() {
  inventoryReady ??= seedInventory();
  return inventoryReady;
}

export async function selectInventoryProducts(
  room: RoomRecord,
  styleId: string,
): Promise<InventoryProduct[]> {
  await ensureInventoryDatabase();

  const db = getDb();
  const rows = await db.select().from(products).where(eq(products.active, true));
  const roomType = inferRoomType(room);
  const categories =
    ROOM_CATEGORY_ALLOWLIST[roomType] ?? ROOM_CATEGORY_ALLOWLIST.living_room;
  const styleAliases = STYLE_ALIASES[styleId] ?? STYLE_ALIASES.modern;
  const budget = room.budgetAmount;

  const ranked = rows
    .filter((product) => categories.has(product.category))
    .sort((a, b) => {
      const categoryDelta =
        categoryPriority(a.category) - categoryPriority(b.category);
      if (categoryDelta !== 0) return categoryDelta;

      const scoreDelta =
        scoreProduct(b, styleAliases, budget) -
        scoreProduct(a, styleAliases, budget);
      if (scoreDelta !== 0) return scoreDelta;

      return (a.price ?? Number.MAX_SAFE_INTEGER) -
        (b.price ?? Number.MAX_SAFE_INTEGER);
    });

  return ranked.slice(0, PRODUCT_LIMIT).map((product) => ({
    id: product.id,
    roomType: product.roomType,
    category: product.category,
    title: product.title,
    price: product.price == null ? undefined : String(product.price),
    currency: product.currency,
    retailer: product.retailer,
    affiliateUrl: product.affiliateUrl,
    productUrl: product.productUrl,
    imageUrl: product.imageUrl,
    width: product.width ?? undefined,
    depth: product.depth ?? undefined,
    height: product.height ?? undefined,
    dimensionUnit: product.dimensionUnit,
    color: product.color ?? undefined,
    material: product.material ?? undefined,
    styleTags: product.styleTags
      .split(";")
      .map((tag) => tag.trim())
      .filter(Boolean),
    dimensions: dimensionsText(product),
    visualDescription: product.visualDescription,
  }));
}

async function seedInventory() {
  const db = getDb();
  await db.execute(sql`
    ALTER TABLE redesigns
    ADD COLUMN IF NOT EXISTS inventory_products jsonb
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source_id varchar(120),
      room_type varchar(64) NOT NULL,
      category varchar(64) NOT NULL,
      title text NOT NULL,
      price real,
      currency varchar(3) NOT NULL DEFAULT 'USD',
      retailer varchar(160) NOT NULL,
      affiliate_url text NOT NULL,
      product_url text NOT NULL UNIQUE,
      image_url text NOT NULL,
      width real,
      depth real,
      height real,
      dimension_unit varchar(10) NOT NULL DEFAULT 'in',
      color text,
      material text,
      style_tags text NOT NULL DEFAULT '',
      visual_description text NOT NULL,
      notes text,
      active boolean NOT NULL DEFAULT true,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    )
  `);

  const values = seedProducts.map((product) => ({
    sourceId: product.sourceId,
    roomType: product.roomType,
    category: product.category,
    title: product.title,
    price: product.price,
    currency: product.currency,
    retailer: product.retailer,
    affiliateUrl: product.affiliateUrl,
    productUrl: product.productUrl,
    imageUrl: product.imageUrl,
    width: product.width,
    depth: product.depth,
    height: product.height,
    dimensionUnit: product.dimensionUnit,
    color: product.color,
    material: product.material,
    styleTags: product.styleTags.join(";"),
    visualDescription: product.visualDescription,
    notes: product.notes,
  }));

  await db.insert(products).values(values).onConflictDoNothing();
}

function inferRoomType(room: RoomRecord) {
  const name = room.name.toLowerCase();
  if (name.includes("bed") || name.includes("master") || name.includes("guest")) {
    return "bedroom";
  }
  return "living_room";
}

function categoryPriority(category: string) {
  return CATEGORY_PRIORITY[category] ?? 50;
}

function scoreProduct(
  product: typeof products.$inferSelect,
  styleAliases: Set<string>,
  budget?: number | null,
) {
  const tags = product.styleTags
    .split(";")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const styleScore = tags.reduce(
    (total, tag) => total + (styleAliases.has(tag) ? 3 : 0),
    0,
  );
  const budgetScore =
    budget && product.price != null && product.price <= budget ? 1 : 0;
  return styleScore + budgetScore;
}

function dimensionsText(product: typeof products.$inferSelect) {
  const parts = [product.width, product.depth, product.height]
    .filter((value): value is number => value != null)
    .map((value) =>
      Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, ""),
    );

  if (parts.length === 0) return undefined;
  return `${parts.join(" x ")} ${product.dimensionUnit}`;
}
