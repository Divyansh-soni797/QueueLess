
import type { Order, OrderItem, PaymentStatus } from "../types/index.js";
import { supabase } from "../config/supabase.js";
import { generateId } from "../utils/token.js";

type OrderRow = {
  id: string;
  shop_id: string;
  total_amount: number | string;
  payment_status: PaymentStatus;
  created_at: string;
};

type OrderItemRow = {
  id: number | string;
  order_id: string;
  product_id: string;
  name: string;
  price: number | string;
  quantity: number;
};

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: String(row.id),
    orderId: row.order_id,
    productId: row.product_id,
    name: row.name,
    price: Number(row.price),
    quantity: row.quantity,
  };
}

async function toOrder(row: OrderRow): Promise<Order> {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", row.id)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch order items: ${error.message}`);
  }

  return {
    id: row.id,
    shopId: row.shop_id,
    items: (data as OrderItemRow[]).map(toOrderItem),
    totalAmount: Number(row.total_amount),
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

export const orderRepository = {
  async create(data: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const id = generateId();

    const { data: created, error } = await supabase.rpc(
      "create_order_with_items",
      {
        p_id: id,
        p_shop_id: data.shopId,
        p_total_amount: data.totalAmount,
        p_payment_status: data.paymentStatus,
        p_items: data.items.map((item) => ({
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    );

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    const result = created as {
      id: string;
      shopId: string;
      items: OrderItem[];
      totalAmount: number | string;
      paymentStatus: PaymentStatus;
      createdAt: string;
    };

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        id: String(item.id),
        price: Number(item.price),
      })),
      totalAmount: Number(result.totalAmount),
    };
  },

  async findById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    return data ? toOrder(data as OrderRow) : null;
  },
  async findRazorpayOrderId(orderId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("razorpay_order_id")
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to fetch Razorpay order ID: ${error.message}`,
      );
    }

    return data?.razorpay_order_id ?? null;
  },
  async findByShop(shopId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    const rows = data as OrderRow[];
    return Promise.all(rows.map(toOrder));
  },
  async setRazorpayOrderId(
    orderId: string,
    razorpayOrderId: string,
  ): Promise<void> {
    const { data, error } = await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrderId })
      .eq("id", orderId)
      .eq("payment_status", "PENDING")
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to save Razorpay order ID: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "Order not found or is no longer pending payment.",
      );
    }
  },
  async updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
  ): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: status })
      .eq("id", orderId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    return data ? toOrder(data as OrderRow) : null;
  },
};
