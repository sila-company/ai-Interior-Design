import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ReplitAppStorageClient } from "./replit-app-storage";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(artifactDir, "../../uploads");
const blobAccess = process.env.BLOB_ACCESS === "public" ? "public" : "private";

let objectStorageClient: ReplitAppStorageClient | null = null;
let objectStorageInit: Promise<ReplitAppStorageClient | null> | null = null;

export function hasVercelBlobConfig(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

export function hasPersistentStorageConfig(): boolean {
  return hasVercelBlobConfig() || Boolean(process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID);
}

async function readStreamToBuffer(
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks);
}

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
  const objectName = toObjectName(relativePath);

  if (hasVercelBlobConfig()) {
    const { put } = await import("@vercel/blob");
    await put(objectName, buffer, {
      access: blobAccess,
      allowOverwrite: false,
      contentType: extension === "png" ? "image/png" : "image/jpeg",
    });
    return objectName;
  }

  const client = await getObjectStorageClient();
  if (client) {
    const result = await client.uploadFromBytes(objectName, buffer, {
      compress: false,
    });
    if (!result.ok) {
      throw new Error(`Could not upload image to App Storage: ${result.error.message}`);
    }
    return objectName;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Persistent file storage is not configured. Add BLOB_READ_WRITE_TOKEN to Vercel.",
    );
  }

  const absolutePath = path.join(uploadsRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return relativePath;
}

export async function readStoredImage(relativePath: string): Promise<Buffer> {
  const objectName = toObjectName(relativePath);

  if (hasVercelBlobConfig()) {
    const { get } = await import("@vercel/blob");
    const result = await get(objectName, { access: blobAccess });
    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new Error("Stored image was not found in Vercel Blob.");
    }
    return readStreamToBuffer(result.stream);
  }

  const client = await getObjectStorageClient();
  if (client) {
    const result = await client.downloadAsBytes(objectName, {
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
