import type { PaymentStatus } from "./order";

export type ExitStatus = "UNUSED" | "USED";

export interface Receipt {
  id: string;
  receiptToken: string;
  orderId: string;
  shopId: string;
  paymentStatus: PaymentStatus;
  exitStatus: ExitStatus;
  createdAt: string;
  usedAt: string | null;
}
