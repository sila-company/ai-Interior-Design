const IMAGE_MODEL = "gpt-image-2";

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

export async function generateRoomRedesign(
  imageBuffer: Buffer,
  prompt: string,
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
    "image",
    new Blob([new Uint8Array(imageBuffer)], { type: "image/png" }),
    "room.png",
  );

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
