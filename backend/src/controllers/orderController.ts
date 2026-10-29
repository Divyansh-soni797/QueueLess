import type { Request, Response } from "express";
import { orderService } from "../services/orderService.js";

export const orderController = {
  async create(req: Request, res: Response) {
  const { shopId, items } = req.body;

  const result = await orderService.createOrder(shopId, items);

  res.status(201).json(result);
},

  async getOrder(req: Request, res: Response) {
    const order = await orderService.getOrder(req.params.orderId);
    res.json(order);
  },

  async listForShop(req: Request, res: Response) {
    const orders = await orderService.listForShop(req.params.shopId);
    res.json(orders);
  },

  async updatePaymentStatus(req: Request, res: Response) {
    const order = await orderService.updatePaymentStatus(req.params.orderId, req.body.status);
    res.json(order);
  },
  async verifyRazorpayPayment(req: Request, res: Response) {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !orderId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    res.status(400).json({
      error: "Missing payment verification fields.",
    });
    return;
  }

  const order = await orderService.verifyRazorpayPayment(
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  res.json({ order });
},
};
