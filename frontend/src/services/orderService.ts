import { api } from "./api";
import type { Order, PaymentStatus } from "../types/order";

interface CreateOrderResponse {
  order: Order;
  upiLink: string;
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

export function updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<Order> {
  return api.patch<Order>(`/orders/${orderId}/payment`, { status });
}
