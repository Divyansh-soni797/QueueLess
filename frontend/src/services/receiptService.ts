import { api } from "./api";
import type { Receipt } from "../types/receipt";

export function getReceiptByOrderId(orderId: string): Promise<Receipt> {
  return api.get<Receipt>(`/orders/${orderId}/receipt`);
}

export interface VerifyResult {
  valid: boolean;
  reason: "NOT_FOUND" | "WRONG_SHOP" | "PAYMENT_NOT_CONFIRMED" | "ALREADY_USED" | null;
  receipt: Receipt | null;
}

export function verifyReceipt(token: string, shopId: string): Promise<VerifyResult> {
  return api.post<VerifyResult>("/receipts/verify", { token, shopId });
}
