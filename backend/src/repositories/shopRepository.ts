
import type { Shop } from "../types/index.js";
import { supabase } from "../config/supabase.js";

type ShopRow = {
  id: string;
  name: string;
  logo_url: string | null;
  upi_id: string | null;
  tagline: string | null;
};

function toShop(row: ShopRow): Shop {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? "",
    upiId: row.upi_id ?? "",
    tagline: row.tagline ?? "",
  };
}

export const shopRepository = {
  async findById(shopId: string): Promise<Shop | null> {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("id", shopId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch shop: ${error.message}`);
    }

    return data ? toShop(data as ShopRow) : null;
  },

  async update(
    shopId: string,
    patch: Partial<Omit<Shop, "id">>,
  ): Promise<Shop | null> {
    const updates: Record<string, unknown> = {};

    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.logoUrl !== undefined) updates.logo_url = patch.logoUrl;
    if (patch.upiId !== undefined) updates.upi_id = patch.upiId;
    if (patch.tagline !== undefined) updates.tagline = patch.tagline;

    if (Object.keys(updates).length === 0) {
      return this.findById(shopId);
    }

    const { data, error } = await supabase
      .from("shops")
      .update(updates)
      .eq("id", shopId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update shop: ${error.message}`);
    }

    return data ? toShop(data as ShopRow) : null;
  },
  async create(shop: {
    id: string;
    name: string;
    upiId: string;
    tagline?: string;
  }): Promise<Shop> {
    const { data, error } = await supabase
      .from("shops")
      .insert({
        id: shop.id,
        name: shop.name,
        upi_id: shop.upiId,
        tagline: shop.tagline ?? "",
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create shop: ${error.message}`);
    }

    return toShop(data as ShopRow);
  },
};
