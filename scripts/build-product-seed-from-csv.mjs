import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outputIndex = args.indexOf("--out");
const outputPath =
  outputIndex >= 0 ? args[outputIndex + 1] : "artifacts/api-server/src/data/product-seed.ts";
const inputPaths = args.filter((arg, index) => {
  if (arg === "--out") return false;
  if (outputIndex >= 0 && index === outputIndex + 1) return false;
  return true;
});

if (inputPaths.length === 0) {
  throw new Error("Provide at least one normalized product CSV.");
}

const productsByUrl = new Map();

for (const inputPath of inputPaths) {
  const text = fs.readFileSync(inputPath, "utf8");
  const [header, ...rows] = parseCsv(text);
  const columns = Object.fromEntries(header.map((name, index) => [name, index]));

  for (const row of rows) {
    const product = normalizeRow(row, columns);
    if (!product.productUrl || productsByUrl.has(product.productUrl)) continue;
    productsByUrl.set(product.productUrl, product);
  }
}

const products = [...productsByUrl.values()];
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `export const seedProducts = ${JSON.stringify(products, null, 2)} as const;\n`,
);

console.log(`Wrote ${products.length} products to ${outputPath}`);

function normalizeRow(row, columns) {
  const productUrl = value(row, columns, "productUrl");
  return {
    sourceId: extractAsin(productUrl),
    roomType: value(row, columns, "roomType"),
    category: value(row, columns, "category"),
    title: ascii(value(row, columns, "title")),
    price: numberOrNull(value(row, columns, "price")),
    currency: value(row, columns, "currency") || "USD",
    retailer: ascii(value(row, columns, "retailer")),
    affiliateUrl: value(row, columns, "affiliateUrl"),
    productUrl,
    imageUrl: value(row, columns, "imageUrl"),
    width: numberOrNull(value(row, columns, "width")),
    depth: numberOrNull(value(row, columns, "depth")),
    height: numberOrNull(value(row, columns, "height")),
    dimensionUnit: value(row, columns, "dimensionUnit") || "in",
    color: ascii(value(row, columns, "color")),
    material: ascii(value(row, columns, "material")),
    styleTags: value(row, columns, "styleTags")
      .split(";")
      .map((tag) => ascii(tag.trim()))
      .filter(Boolean),
    visualDescription: ascii(value(row, columns, "visualDescription")),
    notes: ascii(value(row, columns, "notes")),
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function value(row, columns, key) {
  const index = columns[key];
  return index == null ? "" : String(row[index] ?? "").trim();
}

function numberOrNull(raw) {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function extractAsin(productUrl) {
  const match = productUrl.match(/\/dp\/([A-Z0-9]{10})/);
  return match?.[1] ?? null;
}

function ascii(raw) {
  return raw
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
