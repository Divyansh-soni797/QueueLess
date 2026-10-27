
import { createContext } from "react";
import type { CartLine } from "../types/cart";
import type { Product } from "../types/product";

export interface CartContextValue {
  lines: CartLine[];
  addProduct: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  clear: () => void;
  totalAmount: number;
  itemCount: number;
}

export const CartContext = createContext<CartContextValue | null>(null);
