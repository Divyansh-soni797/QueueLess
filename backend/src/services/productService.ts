import { productRepository } from "../repositories/productRepository.js";
import { shopService } from "./shopService.js";
import { AppError } from "../utils/AppError.js";
import type { Product } from "../types/index.js";

export const productService = {
  async listForShop(shopId: string): Promise<Product[]> {
    await shopService.getShop(shopId); // 404s if shop doesn't exist
    return productRepository.findByShop(shopId);
  },

  async findByBarcode(shopId: string, barcode: string): Promise<Product> {
    await shopService.getShop(shopId);
    const product = await productRepository.findByBarcode(shopId, barcode);
    if (!product) {
      throw new AppError(
        404,
        "PRODUCT_NOT_FOUND",
        "No product in this store matches that barcode.",
      );
    }
    return product;
  },

  async create(shopId: string, data: { barcode: string; name: string; price: number; imageUrl?: string }): Promise<Product> {
    await shopService.getShop(shopId);
    if (!data.name?.trim()) throw new AppError(400, "INVALID_NAME", "Product name is required.");
    if (!data.barcode?.trim()) throw new AppError(400, "INVALID_BARCODE", "Barcode is required.");
    if (typeof data.price !== "number" || data.price <= 0) {
      throw new AppError(400, "INVALID_PRICE", "Price must be a positive number.");
    }
    const existing = await productRepository.findByBarcode(shopId, data.barcode);
    if (existing) {
      throw new AppError(409, "DUPLICATE_BARCODE", "A product with this barcode already exists.");
    }
    return productRepository.create({ shopId, ...data });
  },

  async update(productId: string, patch: Partial<{ name: string; price: number; barcode: string; imageUrl: string }>): Promise<Product> {
    if (patch.price !== undefined && (typeof patch.price !== "number" || patch.price <= 0)) {
      throw new AppError(400, "INVALID_PRICE", "Price must be a positive number.");
    }
    const updated = await productRepository.update(productId, patch);
    if (!updated) throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
    return updated;
  },

  async remove(productId: string): Promise<void> {
    const ok = await productRepository.delete(productId);
    if (!ok) throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  },
};
