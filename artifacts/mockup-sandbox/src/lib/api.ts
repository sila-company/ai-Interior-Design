import { enrichStyle, type DesignStyle } from "./styles";

export interface RedesignResult {
  styleId: string;
  mimeType: string;
  imageBase64: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    if (data.message) return data.message;
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

export async function listDesignStyles(): Promise<DesignStyle[]> {
  const response = await fetch("/api/styles");
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  const styles = (await response.json()) as Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;

  return styles.map(enrichStyle);
}

export async function createRedesign(
  image: File,
  styleId: string,
): Promise<RedesignResult> {
  const form = new FormData();
  form.append("image", image);
  form.append("styleId", styleId);

  const response = await fetch("/api/redesigns", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as RedesignResult;
}

export function redesignToDataUrl(result: RedesignResult): string {
  return `data:${result.mimeType};base64,${result.imageBase64}`;
}
