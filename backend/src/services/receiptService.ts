import { receiptRepository } from "../repositories/receiptRepository.js";
import { generateReceiptToken } from "../utils/token.js";
import { AppError } from "../utils/AppError.js";
import type { Order, Receipt } from "../types/index.js";

export const receiptService = {
  async createForOrder(order: Order): Promise<Receipt> {
    const existing = await receiptRepository.findByOrderId(order.id);
    if (existing) return existing;

    return receiptRepository.create({
      receiptToken: generateReceiptToken(),
      orderId: order.id,
      shopId: order.shopId,
      paymentStatus: order.paymentStatus,
    });
  },

  async getByToken(token: string): Promise<Receipt> {
    const receipt = await receiptRepository.findByToken(token);
    if (!receipt) throw new AppError(404, "RECEIPT_NOT_FOUND", "Receipt not found.");
    return receipt;
  },

  async getByOrderId(orderId: string): Promise<Receipt> {
    const receipt = await receiptRepository.findByOrderId(orderId);
    if (!receipt) throw new AppError(404, "RECEIPT_NOT_FOUND", "Receipt not found for this order.");
    return receipt;
  },

  /**
   * The core security operation. Server-side only — never trust a PAID or
   * VALID flag sent by the client or embedded in the QR itself. The QR only
   * carries an opaque, unguessable token; every other fact is looked up here.
   */
  async verifyAndConsume(token: string, shopId: string) {
    const result = await receiptRepository.markUsedIfValid(token, shopId);

    switch (result.outcome) {
      case "VALID":
        return { valid: true as const, reason: null, receipt: result.receipt };
      case "NOT_FOUND":
        return { valid: false as const, reason: "NOT_FOUND" as const, receipt: null };
      case "WRONG_SHOP":
        return { valid: false as const, reason: "WRONG_SHOP" as const, receipt: null };
      case "PAYMENT_NOT_CONFIRMED":
        return { valid: false as const, reason: "PAYMENT_NOT_CONFIRMED" as const, receipt: result.receipt };
      case "ALREADY_USED":
        return { valid: false as const, reason: "ALREADY_USED" as const, receipt: result.receipt };
    }
  },
};
