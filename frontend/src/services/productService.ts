import { api, ApiError } from "./api";
import type { Product } from "../types/product";

export function listProducts(shopId: string): Promise<Product[]> {
  return api.get<Product[]>(`/shops/${shopId}/products`);
}

export async function findByBarcode(shopId: string, barcode: string): Promise<Product | null> {
  try {
    return await api.get<Product>(`/shops/${shopId}/products/barcode/${encodeURIComponent(barcode)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function createProduct(
  shopId: string,
  data: { barcode: string; name: string; price: number },
): Promise<Product> {
  return api.post<Product>(`/shops/${shopId}/products`, data);
}

export function updateProduct(
  productId: string,
  patch: Partial<{ name: string; price: number; barcode: string }>,
): Promise<Product> {
  return api.put<Product>(`/products/${productId}`, patch);
}

export function deleteProduct(productId: string): Promise<void> {
  return api.delete<void>(`/products/${productId}`);
}
