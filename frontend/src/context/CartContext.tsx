
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CartContext } from "./CartState";
import type { CartLine } from "../types/cart";
import type { Product } from "../types/product";

function storageKey(shopId: string) {
  return `queueless:cart:${shopId}`;
}

export function CartProvider({
  shopId,
  children,
}: {
  shopId: string;
  children: ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(shopId));
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(shopId), JSON.stringify(lines));
    } catch {
      // Cart still works if sessionStorage is unavailable.
    }
  }, [shopId, lines]);

  function addProduct(product: Product) {
    setLines((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);

      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((line) => line.product.id !== productId);
      }

      return prev.map((line) =>
        line.product.id === productId ? { ...line, quantity } : line,
      );
    });
  }

  function removeProduct(productId: string) {
    setLines((prev) =>
      prev.filter((line) => line.product.id !== productId),
    );
  }

  function clear() {
    setLines([]);
  }

  const totalAmount = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.product.price * line.quantity,
        0,
      ),
    [lines],
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        addProduct,
        updateQuantity,
        removeProduct,
        clear,
        totalAmount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
