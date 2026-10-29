import { orderRepository } from "../repositories/orderRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { shopService } from "./shopService.js";
import { receiptService } from "./receiptService.js";
import { AppError } from "../utils/AppError.js";
import { generateId } from "../utils/token.js";
import type { Order, OrderItem, PaymentStatus } from "../types/index.js";
import { razorpayService } from "./razorpayService.js";
interface CartLine {
  productId: string;
  quantity: number;
}

export const orderService = {
  async createOrder(
    shopId: string,
    lines: CartLine[],
  ): Promise<{
    order: Order;
    upiLink: string;
    razorpayOrder: { id: string; amount: number; currency: string };
  }> {
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
    const upiLink = buildUpiLink(
      shop.upiId,
      shop.name,
      order.id,
      totalAmount,
    );
    const razorpayOrder = await razorpayService.createOrder(
      totalAmount,
      order.id,
    );

    await orderRepository.setRazorpayOrderId(
      order.id,
      razorpayOrder.id,
    );

    return {
      order,
      upiLink,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: Number(razorpayOrder.amount),
        currency: razorpayOrder.currency,
      },
    };

  },
  async verifyRazorpayPayment(
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): Promise<Order> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
    }

    if (order.paymentStatus === "SUCCESS") {
      return order;
    }

    if (order.paymentStatus !== "PENDING") {
      throw new AppError(
        400,
        "ORDER_NOT_PENDING",
        "This order is no longer awaiting payment.",
      );
    }

    const savedRazorpayOrderId =
      await orderRepository.findRazorpayOrderId(orderId);

    if (
      !savedRazorpayOrderId ||
      savedRazorpayOrderId !== razorpayOrderId
    ) {
      throw new AppError(
        400,
        "RAZORPAY_ORDER_MISMATCH",
        "Payment does not match this order.",
      );
    }

    const signatureValid =
      razorpayService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );

    if (!signatureValid) {
      throw new AppError(
        400,
        "INVALID_PAYMENT_SIGNATURE",
        "Payment verification failed.",
      );
    }

    const payment =
      await razorpayService.fetchPayment(razorpayPaymentId);

    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      throw new AppError(
        400,
        "PAYMENT_NOT_CONFIRMED",
        "Payment is not captured or the payment details do not match.",
      );
    }

    const updated = await orderRepository.updatePaymentStatus(
      orderId,
      "SUCCESS",
    );

    if (!updated) {
      throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
    }

    await receiptService.createForOrder(updated);

    return updated;
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
  async updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
  ): Promise<Order> {
    // Block SUCCESS unless Razorpay payment is verified.
    if (status === "SUCCESS") {
      throw new AppError(
        403,
        "PAYMENT_VERIFICATION_REQUIRED",
        "Successful payments must be verified through Razorpay.",
      );
    }

    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
    }

    if (order.paymentStatus === "SUCCESS") {
      return order;
    }

    const updated = await orderRepository.updatePaymentStatus(
      orderId,
      status,
    );

    if (!updated) {
      throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
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
