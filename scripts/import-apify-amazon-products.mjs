import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/apify-amazon-products.json";
const outputPath = process.argv[3] ?? "data/apify-normalized-products.csv";
const associateTag = process.env.AMAZON_ASSOCIATE_TAG ?? "";

const rows = JSON.parse(fs.readFileSync(inputPath, "utf8"));
if (!Array.isArray(rows)) {
  throw new Error(`Expected ${inputPath} to contain a JSON array.`);
}

const normalized = rows
  .filter((item) => !item.error)
  .filter((item) => item.inStock !== false)
  .map(normalizeProduct)
  .filter(Boolean);

const header = [
  "roomType",
  "category",
  "title",
  "price",
  "currency",
  "retailer",
  "affiliateUrl",
  "productUrl",
  "imageUrl",
  "width",
  "depth",
  "height",
  "dimensionUnit",
  "color",
  "material",
  "styleTags",
  "visualDescription",
  "notes",
];

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  [
    header.join(","),
    ...normalized.map((product) => header.map((key) => csv(product[key] ?? "")).join(",")),
  ].join("\n") + "\n",
);

console.log(`Imported ${normalized.length} products into ${outputPath}`);

function normalizeProduct(item) {
  const title = String(item.title ?? "").trim();
  const productUrl = normalizeAmazonUrl(item.url, item.asin);
  const category = inferCategory(item);
  const roomType = inferRoomType(item, category);
  const attributes = Object.fromEntries(
    (item.attributes ?? []).map((entry) => [
      String(entry.key ?? "").toLowerCase(),
      String(entry.value ?? ""),
    ]),
  );
  const dimensions = extractDimensions(attributes);
  const color = firstValue(attributes, [
    "color",
    "top color",
    "base color",
    "furniture finish",
  ]);
  const material = firstValue(attributes, [
    "material type",
    "frame material type",
    "top material type",
    "base",
    "base material",
  ]);
  const imageUrl =
    item.highResolutionImages?.[0] ??
    item.thumbnailImage ??
    item.variantDetails?.[0]?.images?.[0] ??
    "";
  const styleTags = inferStyleTags(item, attributes);

  if (!title || !productUrl || !imageUrl || category === "unknown") {
    return null;
  }

  return {
    roomType,
    category,
    title,
    price: item.price?.value ?? "",
    currency: normalizeCurrency(item.price?.currency),
    retailer: item.brand ? `Amazon / ${item.brand}` : "Amazon",
    affiliateUrl: buildAffiliateUrl(productUrl),
    productUrl,
    imageUrl,
    width: dimensions.width ?? "",
    depth: dimensions.depth ?? "",
    height: dimensions.height ?? "",
    dimensionUnit: dimensions.unit ?? "in",
    color,
    material,
    styleTags: styleTags.join(";"),
    visualDescription: buildVisualDescription(title, category, color, material, attributes, item.features),
    notes: [
      item.asin ? `ASIN: ${item.asin}` : "",
      item.inStockText ? `Stock: ${item.inStockText}` : "",
      item.reviewsCount ? `Reviews: ${item.reviewsCount}` : "",
      item.stars ? `Rating: ${item.stars}` : "",
    ].filter(Boolean).join("; "),
  };
}

function normalizeAmazonUrl(url, asin) {
  if (asin) return `https://www.amazon.com/dp/${asin}`;
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
    return match ? `https://www.amazon.com/dp/${match[1]}` : parsed.toString();
  } catch {
    return "";
  }
}

function buildAffiliateUrl(productUrl) {
  if (!associateTag) return productUrl;
  const url = new URL(productUrl);
  url.searchParams.set("tag", associateTag);
  return url.toString();
}

function inferCategory(item) {
  const haystack = `${item.title ?? ""} ${item.breadCrumbs ?? ""}`.toLowerCase();
  if (haystack.includes("accent chair") || haystack.includes("armchair")) return "accent_chair";
  if (haystack.includes("sofa") || haystack.includes("couch") || haystack.includes("loveseat") || haystack.includes("sectional")) return "sofa";
  if (haystack.includes("nightstand") || haystack.includes("bedside table")) return "nightstand";
  if (haystack.includes("bed frame") || haystack.includes("platform bed")) return "bed_frame";
  if (haystack.includes("dresser") || haystack.includes("chest of drawers")) return "dresser";
  if (haystack.includes("coffee table")) return "coffee_table";
  if (haystack.includes("side table") || haystack.includes("end table")) return "side_table";
  if (haystack.includes("rug")) return "rug";
  if (haystack.includes("wall art") || haystack.includes("wall decor") || haystack.includes("canvas")) return "wall_art";
  if (haystack.includes("floor lamp")) return "floor_lamp";
  if (haystack.includes("table lamp")) return "table_lamp";
  return "unknown";
}

function inferRoomType(item, category) {
  const haystack = `${item.title ?? ""} ${item.breadCrumbs ?? ""}`.toLowerCase();
  if (["bed_frame", "nightstand", "dresser"].includes(category)) return "bedroom";
  if (["sofa", "accent_chair", "coffee_table", "side_table", "rug", "wall_art", "floor_lamp", "table_lamp"].includes(category)) return "living_room";
  if (haystack.includes("bedroom")) return "bedroom";
  return "living_room";
}

function extractDimensions(attributes) {
  const raw =
    attributes["item dimensions d x w x h"] ??
    attributes["item dimensions l x w x h"] ??
    attributes["item dimensions"] ??
    attributes["size"] ??
    "";
  const unit = raw.toLowerCase().includes("cm") ? "cm" : "in";
  const numbers = [...raw.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
  if (numbers.length < 3) return {};

  const lower = raw.toLowerCase();
  if (lower.includes("d x w x h")) {
    return { depth: numbers[0], width: numbers[1], height: numbers[2], unit };
  }
  return { depth: numbers[0], width: numbers[1], height: numbers[2], unit };
}

function firstValue(attributes, keys) {
  for (const key of keys) {
    const value = attributes[key];
    if (value) return value;
  }
  return "";
}

function inferStyleTags(item, attributes) {
  const haystack = `${item.title ?? ""} ${item.breadCrumbs ?? ""} ${JSON.stringify(item.features ?? [])} ${attributes["style name"] ?? ""} ${attributes.theme ?? ""}`.toLowerCase();
  const tags = new Set();
  if (haystack.includes("modern")) tags.add("modern");
  if (haystack.includes("minimal")) tags.add("minimalist");
  if (haystack.includes("scandinavian") || haystack.includes("oak") || haystack.includes("natural")) tags.add("scandinavian");
  if (haystack.includes("boho")) tags.add("boho");
  if (haystack.includes("farmhouse") || haystack.includes("rustic")) tags.add("farmhouse");
  if (haystack.includes("cozy") || haystack.includes("fabric") || haystack.includes("warm")) tags.add("cozy");
  if (tags.size === 0) tags.add("modern");
  return [...tags];
}

function buildVisualDescription(title, category, color, material, attributes, features = []) {
  const shape = attributes.shape ? `${attributes.shape.toLowerCase()} ` : "";
  const finish = attributes["furniture finish"] || attributes["finish types"] || "";
  const detail = features?.[0] ? ` Key detail: ${String(features[0]).replace(/\s+/g, " ").slice(0, 180)}` : "";
  return [
    `A ${color ? `${color} ` : ""}${shape}${category.replaceAll("_", " ")}`,
    material ? `made with ${material}` : "",
    finish ? `with ${finish} finish` : "",
    `matching this product title: ${title}.`,
    detail,
  ].filter(Boolean).join(" ");
}

function normalizeCurrency(currency) {
  if (currency === "$") return "USD";
  return currency || "USD";
}

function csv(value) {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}
