
import type { Receipt, PaymentStatus, ExitStatus } from "../types/index.js";
import { supabase } from "../config/supabase.js";
import { generateId } from "../utils/token.js";

type ReceiptRow = {
  id: string;
  receipt_token: string;
  order_id: string;
  shop_id: string;
  payment_status: PaymentStatus;
  exit_status: ExitStatus;
  created_at: string;
  used_at: string | null;
};

type VerifyResult =
  | { outcome: "VALID"; receipt: Receipt }
  | { outcome: "NOT_FOUND" }
  | { outcome: "WRONG_SHOP" }
  | { outcome: "PAYMENT_NOT_CONFIRMED"; receipt: Receipt }
  | { outcome: "ALREADY_USED"; receipt: Receipt };

function toReceipt(row: ReceiptRow): Receipt {
  return {
    id: row.id,
    receiptToken: row.receipt_token,
    orderId: row.order_id,
    shopId: row.shop_id,
    paymentStatus: row.payment_status,
    exitStatus: row.exit_status,
    createdAt: row.created_at,
    usedAt: row.used_at,
  };
}

export const receiptRepository = {
  async create(data: {
    receiptToken: string;
    orderId: string;
    shopId: string;
    paymentStatus: PaymentStatus;
  }): Promise<Receipt> {
    const row = {
      id: generateId(),
      receipt_token: data.receiptToken,
      order_id: data.orderId,
      shop_id: data.shopId,
      payment_status: data.paymentStatus,
      exit_status: "UNUSED" as ExitStatus,
      used_at: null,
    };

    const { data: created, error } = await supabase
      .from("receipts")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create receipt: ${error.message}`);
    }

    return toReceipt(created as ReceiptRow);
  },

  async findByToken(token: string): Promise<Receipt | null> {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("receipt_token", token)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find receipt: ${error.message}`);
    }

    return data ? toReceipt(data as ReceiptRow) : null;
  },

  async findByOrderId(orderId: string): Promise<Receipt | null> {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find receipt by order: ${error.message}`);
    }

    return data ? toReceipt(data as ReceiptRow) : null;
  },

  async markUsedIfValid(
    token: string,
    shopId: string,
  ): Promise<VerifyResult> {
    const { data, error } = await supabase.rpc(
      "verify_and_consume_receipt",
      {
        p_token: token,
        p_shop_id: shopId,
      },
    );

    if (error) {
      throw new Error(`Failed to verify receipt: ${error.message}`);
    }

    const result = data as {
      outcome: VerifyResult["outcome"];
      receipt?: ReceiptRow;
    };

    if (
      result.outcome === "NOT_FOUND" ||
      result.outcome === "WRONG_SHOP"
    ) {
      return { outcome: result.outcome };
    }

    if (!result.receipt) {
      throw new Error("Receipt verification returned no receipt data.");
    }

    return {
      outcome: result.outcome,
      receipt: toReceipt(result.receipt),
    } as VerifyResult;
  },
};
