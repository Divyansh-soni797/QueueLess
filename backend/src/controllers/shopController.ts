import type { Request, Response } from "express";
import { shopService } from "../services/shopService.js";

export const shopController = {
  async getShop(req: Request, res: Response) {
    const shop = await shopService.getShop(req.params.shopId);
    res.json(shop);
  },

  async updateShop(req: Request, res: Response) {
    const shop = await shopService.updateShop(req.params.shopId, req.body);
    res.json(shop);
  },
};
