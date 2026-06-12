import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(artifactDir, "../../uploads");

export function toPublicUploadUrl(relativePath: string): string {
  return `/api/uploads/${relativePath.split(path.sep).join("/")}`;
}

export async function saveUserImage(
  userId: string,
  parts: string[],
  buffer: Buffer,
  extension = "jpg",
): Promise<string> {
  const relativePath = path.join(userId, ...parts, `${crypto.randomUUID()}.${extension}`);
  const absolutePath = path.join(uploadsRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return relativePath;
}

export async function readStoredImage(relativePath: string): Promise<Buffer> {
  const absolutePath = path.join(uploadsRoot, relativePath);
  return readFile(absolutePath);
}

export function resolveUploadAbsolutePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  return path.join(uploadsRoot, normalized);
}
