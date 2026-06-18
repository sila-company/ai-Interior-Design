import { logger } from "../lib/logger";

const IMAGE_MODEL = process.env["OPENAI_IMAGE_MODEL"] ?? "gpt-image-2";
const IMAGE_QUALITY = process.env["OPENAI_IMAGE_QUALITY"] ?? "medium";
const OPENAI_IMAGE_TIMEOUT_MS = readPositiveIntegerEnv(
  "OPENAI_IMAGE_TIMEOUT_MS",
  180_000,
);
const OPENAI_VERIFICATION_TIMEOUT_MS = readPositiveIntegerEnv(
  "OPENAI_VERIFICATION_TIMEOUT_MS",
  45_000,
);
const VERIFICATION_MODEL = process.env["OPENAI_VERIFICATION_MODEL"] ?? "gpt-5.5";

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

interface OpenAIImageResponse {
  data: Array<{
    b64_json?: string;
    url?: string;
  }>;
}

interface OpenAIErrorResponse {
  error?: {
    message?: string;
  };
}

export interface ReferenceImage {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export async function generateRoomRedesign(
  imageBuffer: Buffer,
  prompt: string,
  referenceImages: ReferenceImage[] = [],
): Promise<Buffer> {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const form = new FormData();
  form.append("model", IMAGE_MODEL);
  form.append("prompt", prompt);
  form.append("quality", IMAGE_QUALITY);
  form.append("size", "auto");
  form.append("output_format", "jpeg");
  form.append(
    "image[]",
    new Blob([new Uint8Array(imageBuffer)], { type: "image/png" }),
    "room.png",
  );
  for (const reference of referenceImages) {
    form.append(
      "image[]",
      new Blob([new Uint8Array(reference.buffer)], { type: reference.mimeType }),
      reference.filename,
    );
  }

  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
      signal: AbortSignal.timeout(OPENAI_IMAGE_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(
        `OpenAI image edit timed out after ${Math.round(
          OPENAI_IMAGE_TIMEOUT_MS / 1000,
        )} seconds.`,
      );
    }
    throw error;
  } finally {
    logger.info(
      {
        model: IMAGE_MODEL,
        quality: IMAGE_QUALITY,
        referenceImageCount: referenceImages.length,
        responseTime: Date.now() - startedAt,
      },
      "OpenAI image edit completed",
    );
  }

  const rawBody = await response.text();
  let payload: OpenAIImageResponse | OpenAIErrorResponse;
  try {
    payload = JSON.parse(rawBody) as OpenAIImageResponse | OpenAIErrorResponse;
  } catch {
    throw new Error(`OpenAI returned an invalid response: ${rawBody}`);
  }

  if (!response.ok) {
    const message =
      "error" in payload && payload.error?.message
        ? payload.error.message
        : `OpenAI request failed (${response.status})`;
    throw new Error(message);
  }

  const imageResponse = payload as OpenAIImageResponse;
  const first = imageResponse.data?.[0];
  if (!first) {
    throw new Error("OpenAI returned no image data.");
  }

  if (first.b64_json) {
    return Buffer.from(first.b64_json, "base64");
  }

  if (first.url) {
    const imageDownload = await fetch(first.url);
    if (!imageDownload.ok) {
      throw new Error("Failed to download the generated image from OpenAI.");
    }
    const arrayBuffer = await imageDownload.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("OpenAI returned an unexpected image payload.");
}

interface InventoryProductForVerification {
  category: string;
  title: string;
  retailer: string;
  color?: string;
  material?: string;
  dimensions?: string;
  visualDescription?: string;
}

interface InventoryVerificationResult {
  passed: boolean;
  confidence: number;
  extraItems: string[];
  missingInventoryCategories: string[];
  reasoning: string;
}

interface OpenAIResponseOutput {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
}

export async function verifyInventoryCompliance(
  imageBuffer: Buffer,
  products: InventoryProductForVerification[],
): Promise<InventoryVerificationResult> {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const inventoryText = products
    .map((product, index) => {
      const details = [
        product.visualDescription,
        product.color ? `color: ${product.color}` : "",
        product.material ? `material: ${product.material}` : "",
        product.dimensions ? `dimensions: ${product.dimensions}` : "",
      ].filter(Boolean);
      return `${index + 1}. ${product.category}: ${product.title} (${details.join("; ")})`;
    })
    .join("\n");

  const imageDataUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  const prompt = [
    "You are auditing an AI-generated interior design image for catalog compliance.",
    "The image is allowed to contain ONLY furniture, rugs, wall art, lighting, bedding, storage, and decor that clearly matches the inventory below.",
    "A similar-looking alternative, generic placeholder, or made-up product is NOT compliant. It must visibly match a listed purchasable catalog item by category, color, material, silhouette, and key design details.",
    "Existing architecture such as walls, floors, windows, doors, ceiling, and built-in fixtures is allowed.",
    "Flag any visible movable furniture or decor that is not represented by the inventory list.",
    "Also flag any listed inventory category that should be visible but is missing. The output should be sparse rather than contain unlisted filler.",
    "Return only valid JSON with this shape:",
    '{"passed": boolean, "confidence": number, "extraItems": string[], "missingInventoryCategories": string[], "reasoning": string}',
    "Set passed=false if the image contains unlisted furniture/decor, generic filler products, plants, pillows, throws, lamps, shelves, cabinets, art, tables, beds, chairs, sofas, rugs, or storage not in the inventory.",
    "Set passed=false if any visible product appears to be inspired by the inventory but does not faithfully match a listed product.",
    "Set passed=false if any listed product category is missing from the staged room.",
    "Inventory:",
    inventoryText,
  ].join("\n");

  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VERIFICATION_MODEL,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: imageDataUrl },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(OPENAI_VERIFICATION_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(
        `OpenAI verification timed out after ${Math.round(
          OPENAI_VERIFICATION_TIMEOUT_MS / 1000,
        )} seconds.`,
      );
    }
    throw error;
  } finally {
    logger.info(
      {
        model: VERIFICATION_MODEL,
        responseTime: Date.now() - startedAt,
      },
      "OpenAI verification completed",
    );
  }

  const rawBody = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI verification failed (${response.status}): ${rawBody}`);
  }

  let payload: OpenAIResponseOutput;
  try {
    payload = JSON.parse(rawBody) as OpenAIResponseOutput;
  } catch {
    throw new Error(`OpenAI verification returned invalid JSON: ${rawBody}`);
  }

  const text = extractResponseText(payload);
  if (!text) {
    throw new Error("OpenAI verification returned no text.");
  }

  const jsonText = extractJSON(text);
  try {
    return normalizeVerificationResult(JSON.parse(jsonText));
  } catch {
    throw new Error(`Could not parse inventory verification result: ${text}`);
  }
}

function extractResponseText(payload: OpenAIResponseOutput): string {
  if (payload.output_text) {
    return payload.output_text;
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function extractJSON(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  return match?.[0] ?? trimmed;
}

function normalizeVerificationResult(value: unknown): InventoryVerificationResult {
  const result = value as Partial<InventoryVerificationResult>;
  return {
    passed: Boolean(result.passed),
    confidence: typeof result.confidence === "number" ? result.confidence : 0,
    extraItems: Array.isArray(result.extraItems)
      ? result.extraItems.map(String)
      : [],
    missingInventoryCategories: Array.isArray(result.missingInventoryCategories)
      ? result.missingInventoryCategories.map(String)
      : [],
    reasoning: typeof result.reasoning === "string" ? result.reasoning : "",
  };
}
