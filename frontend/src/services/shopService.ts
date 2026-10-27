import { api, ApiError } from "./api";
import type { Shop } from "../types/shop";

/** Returns the shop matching the given id, or null if not found. */
export async function getShopById(shopId: string): Promise<Shop | null> {
  try {
    return await api.get<Shop>(`/shops/${shopId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function updateShop(shopId: string, patch: Partial<Omit<Shop, "id">>): Promise<Shop> {
  return api.put<Shop>(`/shops/${shopId}`, patch);
}
