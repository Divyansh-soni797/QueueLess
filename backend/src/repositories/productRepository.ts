
import type { Product } from "../types/index.js";
import { supabase } from "../config/supabase.js";
import { generateId } from "../utils/token.js";

type ProductRow = {
  id: string;
  shop_id: string;
  barcode: string;
  name: string;
  price: number | string;
  image_url: string | null;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    shopId: row.shop_id,
    barcode: row.barcode,
    name: row.name,
    price: Number(row.price),
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
  };
}

export const productRepository = {
  async findByShop(shopId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId);

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return (data as ProductRow[]).map(toProduct);
  },

  async findByBarcode(
    shopId: string,
    barcode: string,
  ): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .eq("barcode", barcode)
      .maybeSingle();

    if (error) throw new Error(`Failed to find product: ${error.message}`);
    return data ? toProduct(data as ProductRow) : null;
  },

  async findById(productId: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error) throw new Error(`Failed to find product: ${error.message}`);
    return data ? toProduct(data as ProductRow) : null;
  },

  async create(data: Omit<Product, "id">): Promise<Product> {
    const row = {
      id: generateId(),
      shop_id: data.shopId,
      barcode: data.barcode,
      name: data.name,
      price: data.price,
      image_url: data.imageUrl ?? null,
    };

    const { data: created, error } = await supabase
      .from("products")
      .insert(row)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create product: ${error.message}`);
    return toProduct(created as ProductRow);
  },

  async update(
    productId: string,
    patch: Partial<Omit<Product, "id" | "shopId">>,
  ): Promise<Product | null> {
    const updates: Record<string, unknown> = {};

    if (patch.barcode !== undefined) updates.barcode = patch.barcode;
    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.price !== undefined) updates.price = patch.price;
    if (patch.imageUrl !== undefined) updates.image_url = patch.imageUrl;

    if (Object.keys(updates).length === 0) {
      return this.findById(productId);
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(`Failed to update product: ${error.message}`);
    return data ? toProduct(data as ProductRow) : null;
  },

  async delete(productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select("id");

    if (error) throw new Error(`Failed to delete product: ${error.message}`);
    return data.length > 0;
  },
};
