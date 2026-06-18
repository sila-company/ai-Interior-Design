import { clearAuthToken, getAuthToken } from "./auth-storage";
import type { RedesignProductInput } from "./product-catalog";
import { enrichStyle, type DesignStyle } from "./styles";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  originalImageUrl: string;
  createdAt: string;
  redesignCount: number;
}

export interface Redesign {
  id: string;
  roomId: string;
  styleId: string;
  mimeType: string;
  resultImageUrl: string;
  originalImageUrl?: string;
  imageBase64?: string;
  createdAt: string;
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
  if (response.status === 413) {
    return "Photo is too large. Try a smaller image.";
  }

  try {
    const data = (await response.json()) as { message?: string };
    if (data.message) return data.message;
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    clearAuthToken();
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<{ token: string; user: User }> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
  clearAuthToken();
}

export async function getMe(): Promise<{ user: User }> {
  return apiFetch("/api/auth/me");
}

export async function listDesignStyles(): Promise<DesignStyle[]> {
  const styles = await apiFetch<
    Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
    }>
  >("/api/styles");

  return styles.map(enrichStyle);
}

export async function listRooms(): Promise<Room[]> {
  return apiFetch("/api/rooms");
}

async function compressImageFile(
  file: File,
  maxDimension = 1536,
  quality = 0.82,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare the room photo for upload.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) =>
        nextBlob
          ? resolve(nextBlob)
          : reject(new Error("Could not prepare the room photo for upload.")),
      "image/jpeg",
      quality,
    );
  });

  const filename = file.name.replace(/\.[^.]+$/, "") || "room";
  return new File([blob], `${filename}.jpg`, { type: "image/jpeg" });
}

export async function createRoom(name: string, image: File): Promise<Room> {
  const compressed = await compressImageFile(image);
  const form = new FormData();
  form.append("name", name);
  form.append("image", compressed);

  return apiFetch("/api/rooms", {
    method: "POST",
    body: form,
  });
}

export async function listRedesigns(): Promise<Redesign[]> {
  return apiFetch("/api/redesigns");
}

export async function getRoom(roomId: string): Promise<{
  room: Room;
  redesigns: Redesign[];
}> {
  return apiFetch(`/api/rooms/${roomId}`);
}

export async function createRedesign(
  roomId: string,
  styleId: string,
  products?: RedesignProductInput[],
): Promise<Redesign> {
  return apiFetch("/api/redesigns", {
    method: "POST",
    body: JSON.stringify({ roomId, styleId, products }),
  });
}

export function redesignToDataUrl(redesign: Redesign): string {
  if (redesign.imageBase64) {
    return `data:${redesign.mimeType};base64,${redesign.imageBase64}`;
  }
  return redesign.resultImageUrl;
}

export async function deleteRoom(roomId: string): Promise<void> {
  await apiFetch(`/api/rooms/${roomId}`, { method: "DELETE" });
}

export async function deleteRedesign(redesignId: string): Promise<void> {
  await apiFetch(`/api/redesigns/${redesignId}`, { method: "DELETE" });
}
