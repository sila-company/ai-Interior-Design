import {
  Environment,
  SignedDataVerifier,
  type JWSTransactionDecodedPayload,
} from "@apple/app-store-server-library";

import { logger } from "../lib/logger";

export const MEMBERSHIP_PRODUCT_ID = "com.atelier.interiordesign.membership.monthly";

const DEFAULT_BUNDLE_ID = "com.atelier.interiordesign";

const APPLE_ROOT_CERT_URLS = [
  "https://www.apple.com/appleca/AppleIncRootCertificate.cer",
  "https://www.apple.com/appleca/AppleRootCA-G2.cer",
  "https://www.apple.com/appleca/AppleRootCA-G3.cer",
] as const;

export interface VerifiedSubscriptionTransaction {
  originalTransactionId: string;
  productId: string;
  expiresAt: Date | null;
  status: "active" | "expired" | "grace";
  environment: string;
}

let cachedRootCertificates: Buffer[] | null = null;

export function hasAppleServerApiConfig(): boolean {
  return Boolean(
    process.env.APPLE_ISSUER_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY,
  );
}

export function getAppleBundleId(): string {
  return process.env.APPLE_BUNDLE_ID?.trim() || DEFAULT_BUNDLE_ID;
}

function getAppleEnvironment(): Environment {
  const raw = process.env.APPLE_ENVIRONMENT?.trim().toLowerCase();

  if (raw === "production") {
    return Environment.PRODUCTION;
  }

  if (raw === "xcode") {
    return Environment.XCODE;
  }

  if (raw === "localtesting" || raw === "local_testing" || raw === "local") {
    return Environment.LOCAL_TESTING;
  }

  return Environment.SANDBOX;
}

function decodeJwtPayload<T>(jwt: string): T {
  const payloadPart = jwt.split(".")[1];
  if (!payloadPart) {
    throw new Error("Invalid signed transaction.");
  }

  const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as T;
}

async function loadAppleRootCertificates(): Promise<Buffer[]> {
  if (cachedRootCertificates) {
    return cachedRootCertificates;
  }

  const certificates = await Promise.all(
    APPLE_ROOT_CERT_URLS.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Could not download Apple root certificate: ${url}`);
      }

      return Buffer.from(await response.arrayBuffer());
    }),
  );

  cachedRootCertificates = certificates;
  return certificates;
}

function normalizePrivateKey(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.includes("BEGIN PRIVATE KEY")) {
    return trimmed;
  }

  const decoded = Buffer.from(trimmed, "base64").toString("utf8");
  if (decoded.includes("BEGIN PRIVATE KEY")) {
    return decoded;
  }

  return trimmed;
}

function resolveSubscriptionStatus(
  transaction: JWSTransactionDecodedPayload,
  expiresAt: Date | null,
): "active" | "expired" | "grace" {
  if (transaction.revocationDate) {
    return "expired";
  }

  if (!expiresAt) {
    return "expired";
  }

  if (expiresAt.getTime() > Date.now()) {
    return "active";
  }

  return "expired";
}

function toVerifiedSubscription(
  transaction: JWSTransactionDecodedPayload,
): VerifiedSubscriptionTransaction {
  const productId = transaction.productId?.trim();
  const originalTransactionId = transaction.originalTransactionId?.trim();

  if (!productId || !originalTransactionId) {
    throw new Error("Signed transaction is missing product or transaction identifiers.");
  }

  if (productId !== MEMBERSHIP_PRODUCT_ID) {
    throw new Error("Signed transaction is not for Atelier Membership.");
  }

  const bundleId = transaction.bundleId?.trim() || getAppleBundleId();
  if (bundleId !== getAppleBundleId()) {
    throw new Error("Signed transaction bundle ID does not match this app.");
  }

  const expiresAt =
    typeof transaction.expiresDate === "number"
      ? new Date(transaction.expiresDate)
      : null;

  return {
    originalTransactionId,
    productId,
    expiresAt,
    status: resolveSubscriptionStatus(transaction, expiresAt),
    environment: String(transaction.environment ?? getAppleEnvironment()),
  };
}

async function verifyWithAppleLibrary(
  signedTransaction: string,
): Promise<JWSTransactionDecodedPayload> {
  const rootCertificates = await loadAppleRootCertificates();
  const verifier = new SignedDataVerifier(
    rootCertificates,
    true,
    getAppleEnvironment(),
    getAppleBundleId(),
  );

  return verifier.verifyAndDecodeTransaction(signedTransaction);
}

export async function verifySignedTransaction(
  signedTransaction: string,
): Promise<VerifiedSubscriptionTransaction> {
  const isProduction = process.env.NODE_ENV === "production";
  const hasVerificationConfig = Boolean(getAppleBundleId());

  if (!hasVerificationConfig) {
    if (isProduction) {
      throw new Error("Apple IAP verification is not configured.");
    }

    logger.warn("Apple IAP env vars missing; attempting JWS verification in dev mode.");
  }

  try {
    const decoded = await verifyWithAppleLibrary(signedTransaction);
    return toVerifiedSubscription(decoded);
  } catch (error) {
    if (isProduction) {
      throw error instanceof Error
        ? error
        : new Error("Could not verify signed transaction.");
    }

    logger.warn(
      { err: error },
      "Apple JWS verification failed in dev mode; accepting decoded sandbox transaction.",
    );

    const decoded = decodeJwtPayload<JWSTransactionDecodedPayload>(signedTransaction);
    return toVerifiedSubscription(decoded);
  }
}

export function getApplePrivateKey(): string | null {
  const raw = process.env.APPLE_PRIVATE_KEY?.trim();
  if (!raw) {
    return null;
  }

  return normalizePrivateKey(raw);
}
