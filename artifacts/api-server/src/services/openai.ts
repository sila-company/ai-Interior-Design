import { logger } from "../lib/logger";

const IMAGE_MODEL = process.env["OPENAI_IMAGE_MODEL"] ?? "gpt-image-2";
const IMAGE_QUALITY = process.env["OPENAI_IMAGE_QUALITY"] ?? "medium";
const OPENAI_IMAGE_TIMEOUT_MS = readPositiveIntegerEnv(
  "OPENAI_IMAGE_TIMEOUT_MS",
  180_000,
);

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
