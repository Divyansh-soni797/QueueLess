
import { api } from "./api";
import type { Order, PaymentStatus } from "../types/order";

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

interface CreateOrderResponse {
  order: Order;
  upiLink: string;
  razorpayOrder: RazorpayOrder;
}

interface VerifyPaymentInput {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function createOrder(
  shopId: string,
  items: { productId: string; quantity: number }[],
): Promise<CreateOrderResponse> {
  return api.post<CreateOrderResponse>("/orders", { shopId, items });
}

export function getOrder(orderId: string): Promise<Order> {
  return api.get<Order>(`/orders/${orderId}`);
}

export function listOrdersForShop(shopId: string): Promise<Order[]> {
  return api.get<Order[]>(`/shops/${shopId}/orders`);
}

export function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus,
): Promise<Order> {
  return api.patch<Order>(`/orders/${orderId}/payment`, { status });
}

export function verifyRazorpayPayment(
  input: VerifyPaymentInput,
): Promise<{ order: Order }> {
  return api.post<{ order: Order }>("/orders/verify-payment", input);
}
