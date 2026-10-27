import { randomBytes, randomUUID } from "node:crypto";

/** Generates a URL-safe, unguessable receipt token. Not sequential, not derived from order data. */
export function generateReceiptToken(): string {
  return randomBytes(24).toString("base64url");
}

export function generateId(): string {
  return randomUUID();
}
