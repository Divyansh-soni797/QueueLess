import type { Request, Response } from "express";
import { orderService } from "../services/orderService.js";

export const orderController = {
  async create(req: Request, res: Response) {
    const { shopId, items } = req.body;
    const { order, upiLink } = await orderService.createOrder(shopId, items);
    res.status(201).json({ order, upiLink });
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
};
