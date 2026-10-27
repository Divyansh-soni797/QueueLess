import type { Request, Response } from "express";
import { productService } from "../services/productService.js";

export const productController = {
  async listForShop(req: Request, res: Response) {
    const products = await productService.listForShop(req.params.shopId);
    res.json(products);
  },

  async findByBarcode(req: Request, res: Response) {
    const product = await productService.findByBarcode(req.params.shopId, req.params.barcode);
    res.json(product);
  },

  async create(req: Request, res: Response) {
    const product = await productService.create(req.params.shopId, req.body);
    res.status(201).json(product);
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(req.params.productId, req.body);
    res.json(product);
  },

  async remove(req: Request, res: Response) {
    await productService.remove(req.params.productId);
    res.status(204).send();
  },
};
