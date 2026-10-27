import { shopRepository } from "../repositories/shopRepository.js";
import { AppError } from "../utils/AppError.js";
import type { Shop } from "../types/index.js";

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
};
