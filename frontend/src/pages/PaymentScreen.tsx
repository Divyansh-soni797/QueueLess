import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Smartphone } from "lucide-react";
import { getOrder, updatePaymentStatus } from "../services/orderService";
import { useCart } from "../context/CartContext";
import Button from "../components/Button";
import type { Order } from "../types/order";

export default function PaymentScreen() {
  const { shopId, orderId } = useParams<{ shopId: string; orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { clear } = useCart();

  const upiLink = (location.state as { upiLink?: string } | null)?.upiLink;

  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getOrder(orderId).then(setOrder);
  }, [orderId]);

  async function handleOutcome(status: "SUCCESS" | "FAILED" | "CANCELLED") {
    if (!orderId) return;
    setUpdating(true);
    const updated = await updatePaymentStatus(orderId, status);
    setOrder(updated);
    setUpdating(false);
    if (status === "SUCCESS") {
      clear();
      navigate(`/shop/${shopId}/receipt/${orderId}`, { replace: true });
    }
  }

  function openUpiApp() {
    if (upiLink) window.location.href = upiLink;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-mist">
          <span className="scan-line" />
        </div>
      </div>
    );
  }

  if (order.paymentStatus === "FAILED" || order.paymentStatus === "CANCELLED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 text-center">
        <XCircle size={56} className="text-coral mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">
          {order.paymentStatus === "CANCELLED" ? "Payment cancelled" : "Payment failed"}
        </h1>
        <p className="text-ink/60 text-sm mb-8">Your cart items were not charged.</p>
        <Button onClick={() => navigate(`/shop/${shopId}/cart`)}>Back to cart</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col px-5 pt-10 pb-8">
      <div className="text-center mb-8">
        <p className="font-num text-xs text-brand uppercase tracking-widest mb-2">
          Amount due
        </p>
        <p className="font-num font-bold text-5xl">₹{order.totalAmount.toFixed(2)}</p>
      </div>

      <div className="bg-mist rounded-[var(--radius-card)] p-5 mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1.5">
            <span className="text-ink/70">
              {item.name} × {item.quantity}
            </span>
            <span className="font-num">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <Button onClick={openUpiApp} className="flex items-center justify-center gap-2 mb-3">
        <Smartphone size={18} />
        Pay with UPI app
      </Button>

      <p className="text-center text-ink/40 text-xs px-4 mb-8 leading-relaxed">
        This opens your UPI app to complete payment to the store directly.
        QueueLess never holds your money. As a prototype, returning from the
        UPI app doesn't automatically confirm payment — use the buttons below
        once you've completed (or cancelled) payment in your app.
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <Button onClick={() => handleOutcome("SUCCESS")} disabled={updating}>
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            I've completed the payment
          </span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleOutcome("CANCELLED")}
          disabled={updating}
        >
          Cancel payment
        </Button>
      </div>
    </div>
  );
}
