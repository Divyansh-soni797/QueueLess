import { shopRepository } from "../repositories/shopRepository.js";
import { AppError } from "../utils/AppError.js";
import type { Shop } from "../types/index.js";
import { randomUUID } from "node:crypto";
export const shopService = {
  async getShop(shopId: string): Promise<Shop> {
    const shop = await shopRepository.findById(shopId);
    if (!shop) {
      throw new AppError(404, "SHOP_NOT_FOUND", "This store could not be found.");
    }
    return shop;
  },

  async updateShop(shopId: string, patch: Partial<Omit<Shop, "id">>): Promise<Shop> {
    if (patch.upiId !== undefined && !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(patch.upiId)) {
      throw new AppError(400, "INVALID_UPI_ID", "That doesn't look like a valid UPI ID.");
    }
    const updated = await shopRepository.update(shopId, patch);
    if (!updated) {
      throw new AppError(404, "SHOP_NOT_FOUND", "This store could not be found.");
    }
    return updated;
  },

  async createShop(input: {
    name: string;
    upiId: string;
    tagline?: string;
  }): Promise<Shop> {
    const name = input.name.trim();
    const upiId = input.upiId.trim();
    const tagline = input.tagline?.trim() ?? "";
    const id = `shop-${randomUUID()}`;
    if (name.length < 2 || name.length > 100) {
      throw new AppError(
        400,
        "INVALID_SHOP_NAME",
        "Store name must be between 2 and 100 characters.",
      );
    }

    if (!/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      throw new AppError(
        400,
        "INVALID_UPI_ID",
        "That doesn't look like a valid UPI ID.",
      );
    }

    if (tagline.length > 150) {
      throw new AppError(
        400,
        "INVALID_TAGLINE",
        "Tagline must be 150 characters or fewer.",
      );
    }


    return shopRepository.create({
      id,
      name,
      upiId,
      tagline,
    });
  },

};
