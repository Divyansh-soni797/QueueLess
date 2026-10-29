
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Smartphone, ChevronLeft } from "lucide-react";
import {
  getOrder,
  verifyRazorpayPayment,
  updatePaymentStatus,
} from "../services/orderService";
import { useCart } from "../context/useCart";
import Button from "../components/Button";
import type { Order } from "../types/order";

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    callback: (response: {
      error?: { description?: string };
    }) => void,
  ) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

interface PaymentLocationState {
  razorpayOrder?: {
    id: string;
    amount: number;
    currency: string;
  };
}

export default function PaymentScreen() {
  const { shopId, orderId } = useParams<{
    shopId: string;
    orderId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { clear } = useCart();

  const razorpayOrder = (
    location.state as PaymentLocationState | null
  )?.razorpayOrder;

  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () =>
      setError("Could not load payment checkout. Please refresh and try again.");

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (!orderId) return;

    let active = true;

    getOrder(orderId)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch(() => {
        if (active) setError("Could not load your order. Please try again.");
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  async function handlePayment() {
    if (!orderId || !shopId || !order || !razorpayOrder) {
      setError("Payment details are missing. Return to your cart and try again.");
      return;
    }

    if (!scriptLoaded || !window.Razorpay) {
      setError("Payment checkout is still loading. Please try again.");
      return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

    if (!key) {
      setError("Razorpay Key ID is missing from frontend environment settings.");
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const checkout = new window.Razorpay({
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "QueueLess",
        description: `Order ${order.id}`,
        order_id: razorpayOrder.id,
        theme: { color: "#5b3df6" },

        handler: async (response) => {
          try {
            const result = await verifyRazorpayPayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setOrder(result.order);
            clear();
            navigate(`/shop/${shopId}/receipt/${orderId}`, {
              replace: true,
            });
          } catch {
            setError(
              "Payment verification could not be completed. Do not retry payment yet; refresh the order status or contact the store.",
            );
            setUpdating(false);
          }
        },

        modal: {
          ondismiss: () => setUpdating(false),
        },
      });

      checkout.on("payment.failed", (response) => {
        setError(
          response.error?.description ?? "Payment failed. Please try again.",
        );
        setUpdating(false);
      });

      checkout.open();
    } catch {
      setError("Could not open Razorpay Checkout. Please try again.");
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!orderId || !shopId) return;

    setUpdating(true);
    setError(null);

    try {
      const updated = await updatePaymentStatus(orderId, "CANCELLED");
      setOrder(updated);
      navigate(`/shop/${shopId}/cart`);
    } catch {
      setError("Could not cancel this order. You can return to your cart.");
      setUpdating(false);
    }
  }

  if (!order) {
    return (
      <main className="flex min-h-screen min-h-dvh items-center justify-center bg-paper px-4">
        <div
          className="relative h-16 w-16 overflow-hidden rounded-2xl bg-mist"
          role="status"
          aria-label="Loading order"
        >
          <span className="scan-line" />
        </div>
      </main>
    );
  }

  if (order.paymentStatus === "FAILED" || order.paymentStatus === "CANCELLED") {
    return (
      <main className="flex min-h-screen min-h-dvh flex-col items-center justify-center bg-paper px-5 py-10 text-center">
        <XCircle size={52} className="mb-4 text-coral sm:h-14 sm:w-14" />

        <h1 className="mb-2 font-display text-2xl font-bold sm:text-3xl">
          {order.paymentStatus === "CANCELLED"
            ? "Payment cancelled"
            : "Payment failed"}
        </h1>

        <p className="mb-8 max-w-sm text-sm leading-6 text-ink/60">
          No successful payment has been confirmed for this order.
        </p>

        <div className="w-full max-w-sm">
          <Button onClick={() => navigate(`/shop/${shopId}/cart`)}>
            Back to cart
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen min-h-dvh bg-paper px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full max-w-lg flex-col">
        <header className="mb-7 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/shop/${shopId}/cart`)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist"
            aria-label="Back to cart"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">
              Checkout
            </h1>
            <p className="text-xs text-ink/50 sm:text-sm">
              Review your order and complete payment.
            </p>
          </div>
        </header>

        <section className="mb-6 rounded-3xl bg-mist px-4 py-6 text-center sm:px-6 sm:py-8">
          <p className="mb-2 font-num text-xs uppercase tracking-widest text-brand">
            Amount due
          </p>

          <p className="break-all font-num text-4xl font-bold tracking-tight sm:text-5xl">
            ₹{order.totalAmount.toFixed(2)}
          </p>

          <p className="mt-2 text-xs text-ink/50">
            Order #{order.id}
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="mb-3 font-display font-bold">Order summary</h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex min-w-0 items-start justify-between gap-3 text-sm"
              >
                <span className="min-w-0 flex-1 break-words leading-5 text-ink/70">
                  {item.name} × {item.quantity}
                </span>

                <span className="shrink-0 font-num">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 font-bold">
            <span>Total</span>
            <span className="shrink-0 font-num">
              ₹{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-coral/10 p-3 text-sm leading-5 text-coral"
          >
            {error}
          </p>
        )}

        <Button
          onClick={handlePayment}
          disabled={
            updating ||
            order.paymentStatus === "SUCCESS" ||
            !scriptLoaded
          }
          className="mb-3 gap-2"
        >
          <Smartphone size={19} />
          {updating
            ? "Processing payment..."
            : !scriptLoaded
              ? "Loading payment..."
              : "Pay securely with Razorpay"}
        </Button>

        {order.paymentStatus === "SUCCESS" && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-green-700">
            <CheckCircle2 size={20} />
            Payment verified
          </div>
        )}

        <p className="mb-7 px-2 text-center text-xs leading-5 text-ink/40">
          Test Mode payments are simulated and do not charge real money.
          QueueLess confirms payment only after server-side verification.
        </p>

        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={updating || order.paymentStatus === "SUCCESS"}
        >
          Cancel and return to cart
        </Button>
      </div>
    </main>
  );
}
