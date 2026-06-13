import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ReplitAppStorageClient } from "./replit-app-storage";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(artifactDir, "../../uploads");

let objectStorageClient: ReplitAppStorageClient | null = null;
let objectStorageInit: Promise<ReplitAppStorageClient | null> | null = null;

async function getObjectStorageClient(): Promise<ReplitAppStorageClient | null> {
  const bucketId = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) {
    return null;
  }

  if (objectStorageClient) {
    return objectStorageClient;
  }

  objectStorageInit ??= import("./replit-app-storage.js").then(({ ReplitAppStorageClient }) => {
    objectStorageClient = new ReplitAppStorageClient({ bucketId });
    return objectStorageClient;
  });

  return objectStorageInit;
}

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
  const client = await getObjectStorageClient();
  if (client) {
    const objectName = toObjectName(relativePath);
    const result = await client.uploadFromBytes(objectName, buffer, {
      compress: false,
    });
    if (!result.ok) {
      throw new Error(`Could not upload image to App Storage: ${result.error.message}`);
    }
    return objectName;
  }

  const absolutePath = path.join(uploadsRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return relativePath;
}

export async function readStoredImage(relativePath: string): Promise<Buffer> {
  const client = await getObjectStorageClient();
  if (client) {
    const result = await client.downloadAsBytes(toObjectName(relativePath), {
      decompress: false,
    });
    if (!result.ok) {
      throw new Error(`Stored image was not found in App Storage: ${result.error.message}`);
    }
    return result.value[0];
  }

  const absolutePath = path.join(uploadsRoot, relativePath);
  return readFile(absolutePath);
}

export function resolveUploadAbsolutePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  return path.join(uploadsRoot, normalized);
}

function toObjectName(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}
