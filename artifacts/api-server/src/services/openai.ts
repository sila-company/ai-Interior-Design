const IMAGE_MODEL = "gpt-image-2";
const VERIFICATION_MODEL = process.env["OPENAI_VERIFICATION_MODEL"] ?? "gpt-5.5";

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
  form.append("quality", "high");
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

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

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
    "Existing architecture such as walls, floors, windows, doors, ceiling, and built-in fixtures is allowed.",
    "Flag any visible movable furniture or decor that is not represented by the inventory list.",
    "Return only valid JSON with this shape:",
    '{"passed": boolean, "confidence": number, "extraItems": string[], "missingInventoryCategories": string[], "reasoning": string}',
    "Set passed=false if the image contains unlisted furniture/decor, generic filler products, plants, pillows, throws, lamps, shelves, cabinets, art, tables, beds, chairs, sofas, rugs, or storage not in the inventory.",
    "Inventory:",
    inventoryText,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
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
  });

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
