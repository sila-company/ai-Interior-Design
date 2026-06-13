const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const REPLIT_ADC = {
  audience: "replit",
  subject_token_type: "access_token",
  token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
  type: "external_account",
  credential_source: {
    url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
    format: {
      type: "json",
      subject_token_field_name: "access_token",
    },
  },
  universe_domain: "googleapis.com",
} as const;

type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { message: string } };

type GcsBucket = Awaited<ReturnType<typeof createBucket>>;

async function createBucket(bucketId: string) {
  const { Storage } = await import("@google-cloud/storage");
  const gcs = new Storage({
    credentials: REPLIT_ADC,
    projectId: "",
  });
  return gcs.bucket(bucketId);
}

export class ReplitAppStorageClient {
  private bucketPromise: Promise<GcsBucket>;

  constructor(options: { bucketId: string }) {
    this.bucketPromise = createBucket(options.bucketId);
  }

  async uploadFromBytes(
    objectName: string,
    contents: Buffer,
    options?: { compress?: boolean },
  ): Promise<StorageResult<null>> {
    try {
      const bucket = await this.bucketPromise;
      await bucket.file(objectName).save(contents, {
        gzip: options?.compress,
      });
      return { ok: true, value: null };
    } catch (error) {
      return {
        ok: false,
        error: { message: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  async downloadAsBytes(
    objectName: string,
    options?: { decompress?: boolean },
  ): Promise<StorageResult<Buffer[]>> {
    try {
      const bucket = await this.bucketPromise;
      const buffer = await bucket.file(objectName).download(options);
      return { ok: true, value: buffer };
    } catch (error) {
      return {
        ok: false,
        error: { message: error instanceof Error ? error.message : String(error) },
      };
    }
  }
}
