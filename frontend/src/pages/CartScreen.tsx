import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";
import { ApiError } from "../services/api";
import Button from "../components/Button";

export default function CartScreen() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { lines, updateQuantity, removeProduct, totalAmount, clear } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!shopId || lines.length === 0) return;
    setCheckingOut(true);
    setError(null);
    try {
      const { order, upiLink } = await createOrder(
        shopId,
        lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      );
      navigate(`/shop/${shopId}/pay/${order.id}`, { state: { upiLink } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start checkout. Try again.");
      setCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col px-5 pt-5 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/shop/${shopId}/scan`)}
          className="w-9 h-9 rounded-full bg-mist flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold">Your cart</h1>
      </div>

      {lines.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-mist flex items-center justify-center mb-4">
            <ShoppingBag size={26} className="text-ink/40" />
          </div>
          <p className="font-display font-bold text-lg mb-1">Your cart is empty</p>
          <p className="text-ink/50 text-sm mb-6">Scan a product to add it here.</p>
          <Button variant="secondary" onClick={() => navigate(`/shop/${shopId}/scan`)}>
            Start scanning
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col gap-3">
            {lines.map((line) => (
              <div
                key={line.product.id}
                className="bg-mist rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-display font-bold shrink-0">
                  {line.product.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{line.product.name}</p>
                  <p className="font-num text-sm text-ink/60">
                    ₹{line.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-paper rounded-full border border-line">
                  <button
                    onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-num text-sm w-5 text-center">{line.quantity}</span>
                  <button
                    onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeProduct(line.product.id)}
                  className="w-8 h-8 flex items-center justify-center text-coral shrink-0"
                  aria-label={`Remove ${line.product.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button onClick={clear} className="text-ink/40 text-xs self-start mt-1 underline">
              Clear cart
            </button>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-lg">Total</span>
              <span className="font-num font-bold text-xl">₹{totalAmount.toFixed(2)}</span>
            </div>
            {error && <p className="text-coral text-sm mb-3 text-center">{error}</p>}
            <Button onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? "Preparing checkout…" : "Pay via UPI"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
