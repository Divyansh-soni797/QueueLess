import { orderRepository } from "../repositories/orderRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { shopService } from "./shopService.js";
import { receiptService } from "./receiptService.js";
import { AppError } from "../utils/AppError.js";
import { generateId } from "../utils/token.js";
import type { Order, OrderItem, PaymentStatus } from "../types/index.js";

interface CartLine {
  productId: string;
  quantity: number;
}

export const orderService = {
  async createOrder(shopId: string, lines: CartLine[]): Promise<{ order: Order; upiLink: string }> {
    const shop = await shopService.getShop(shopId);

    if (!Array.isArray(lines) || lines.length === 0) {
      throw new AppError(400, "EMPTY_CART", "Your cart is empty.");
    }

    // IMPORTANT: price always comes from the database, never from the client.
    const items: OrderItem[] = [];
    for (const line of lines) {
      if (!line.productId || !Number.isInteger(line.quantity) || line.quantity <= 0) {
        throw new AppError(400, "INVALID_CART_LINE", "Cart contains an invalid item.");
      }
      const product = await productRepository.findById(line.productId);
      if (!product || product.shopId !== shopId) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "One of the items in your cart no longer exists.");
      }
      items.push({
        id: generateId(),
        orderId: "", // The repository assigns the order ID when saving the order.
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: line.quantity,
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await orderRepository.create({
      shopId,
      items,
      totalAmount,
      paymentStatus: "PENDING",
    });

    const upiLink = buildUpiLink(shop.upiId, shop.name, order.id, totalAmount);

    return { order, upiLink };
  },

  async getOrder(orderId: string): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
    return order;
  },

  async listForShop(shopId: string): Promise<Order[]> {
    await shopService.getShop(shopId);
    return orderRepository.findByShop(shopId);
  },

  /**
   * Updates payment status for a prototype flow. In a real integration this
   * would be driven by a payment gateway webhook, not a client call — see
   * README "Known Limitations".
   */
  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");

    if (order.paymentStatus === "SUCCESS") {
      // Already settled — do not allow flipping a successful payment.
      return order;
    }

    const updated = await orderRepository.updatePaymentStatus(orderId, status);
    if (!updated) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");

    if (status === "SUCCESS") {
      await receiptService.createForOrder(updated);
    }

    return updated;
  },
};

function buildUpiLink(upiId: string, shopName: string, orderId: string, amount: number): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: shopName,
    tr: orderId,
    am: amount.toFixed(2),
    cu: "INR",
  });
  return `upi://pay?${params.toString()}`;
}
