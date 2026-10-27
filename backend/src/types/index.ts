export interface Shop {
  id: string;
  name: string;
  logoUrl?: string;
  upiId: string;
  tagline?: string;
}

export interface Product {
  id: string;
  shopId: string;
  barcode: string;
  name: string;
  price: number; // in INR rupees
  imageUrl?: string;
}

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type ExitStatus = "UNUSED" | "USED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  shopId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

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
