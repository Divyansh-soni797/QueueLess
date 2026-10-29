
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/useCart";
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
    if (!shopId || lines.length === 0 || checkingOut) return;

    setCheckingOut(true);
    setError(null);

    try {
      const { order, razorpayOrder } = await createOrder(
        shopId,
        lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      );

      navigate(`/shop/${shopId}/pay/${order.id}`, {
        state: { razorpayOrder },
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't start checkout. Try again.",
      );
      setCheckingOut(false);
    }
  }

  return (
    <main className="flex min-h-screen min-h-dvh flex-col bg-paper px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <header className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/shop/${shopId}/scan`)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist transition-colors hover:bg-line"
            aria-label="Back to scanning"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">
              Your cart
            </h1>
            <p className="text-xs text-ink/50 sm:text-sm">
              Review your items before payment.
            </p>
          </div>
        </header>

        {lines.length === 0 ? (
          <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-mist">
              <ShoppingBag size={26} className="text-ink/40" />
            </div>

            <h2 className="mb-1 font-display text-lg font-bold">
              Your cart is empty
            </h2>

            <p className="mb-6 text-sm text-ink/50">
              Scan a product to add it here.
            </p>

            <Button
              variant="secondary"
              onClick={() => navigate(`/shop/${shopId}/scan`)}
            >
              Start scanning
            </Button>
          </section>
        ) : (
          <>
            <section className="flex-1 space-y-3">
              {lines.map((line) => (
                <article
                  key={line.product.id}
                  className="flex min-w-0 items-center gap-3 rounded-2xl bg-mist p-3 sm:gap-4 sm:p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-display font-bold text-brand">
                    {line.product.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-snug sm:text-base">
                      {line.product.name}
                    </p>

                    <p className="mt-1 font-num text-sm text-ink/60">
                      ₹{line.product.price.toFixed(2)}
                    </p>

                    <div className="mt-2 inline-flex h-9 items-center gap-1 rounded-full border border-line bg-paper">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.product.id, line.quantity - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        aria-label={`Decrease quantity of ${line.product.name}`}
                      >
                        <Minus size={14} />
                      </button>

                      <span
                        className="w-6 text-center font-num text-sm"
                        aria-label={`Quantity ${line.quantity}`}
                      >
                        {line.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.product.id, line.quantity + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        aria-label={`Increase quantity of ${line.product.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeProduct(line.product.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-coral transition-colors hover:bg-coral/10"
                    aria-label={`Remove ${line.product.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}

              <button
                type="button"
                onClick={clear}
                className="min-h-11 rounded-lg px-2 text-sm text-ink/50 underline underline-offset-4"
              >
                Clear cart
              </button>
            </section>

            <section className="mt-6 border-t border-line pt-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="font-display text-lg font-bold">Total</span>

                <span className="font-num text-xl font-bold sm:text-2xl">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              {error && (
                <p className="mb-3 text-center text-sm text-coral" role="alert">
                  {error}
                </p>
              )}

              <Button onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? "Preparing checkout..." : "Continue to payment"}
              </Button>

              <p className="mt-3 text-center text-xs text-ink/40">
                Your payment will be processed securely.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
