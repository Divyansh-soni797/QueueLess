import type { Request, Response } from "express";
import { receiptService } from "../services/receiptService.js";

export const receiptController = {
  async getByOrderId(req: Request, res: Response) {
    const receipt = await receiptService.getByOrderId(req.params.orderId);
    res.json(receipt);
  },

  async verify(req: Request, res: Response) {
    const { token, shopId } = req.body;
    const result = await receiptService.verifyAndConsume(token, shopId);
    res.json(result);
  },
};
