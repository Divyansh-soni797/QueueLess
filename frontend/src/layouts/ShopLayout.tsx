import { Outlet, useParams } from "react-router-dom";
import { CartProvider } from "../context/CartContext";

export default function ShopLayout() {
  const { shopId } = useParams<{ shopId: string }>();

  if (!shopId) return null;

  return (
    <CartProvider shopId={shopId}>
      <Outlet />
    </CartProvider>
  );
}
