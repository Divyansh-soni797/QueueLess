import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getOrder } from "../services/orderService";
import { getReceiptByOrderId } from "../services/receiptService";
import { getShopById } from "../services/shopService";
import QrCodeDisplay from "../components/QrCodeDisplay";
import Button from "../components/Button";
import type { Order } from "../types/order";
import type { Receipt } from "../types/receipt";
import type { Shop } from "../types/shop";

export default function ReceiptScreen() {
  const { shopId, orderId } = useParams<{ shopId: string; orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!orderId || !shopId) return;
    Promise.all([getOrder(orderId), getReceiptByOrderId(orderId), getShopById(shopId)]).then(
      ([o, r, s]) => {
        setOrder(o);
        setReceipt(r);
        setShop(s);
      },
    );
  }, [orderId, shopId]);

  if (!order || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-mist">
          <span className="scan-line" />
        </div>
      </div>
    );
  }

  const isUsed = receipt.exitStatus === "USED";

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center px-5 pt-10 pb-8">
      <div className="w-14 h-14 rounded-full bg-lime/30 flex items-center justify-center mb-4">
        <CheckCircle2 size={28} className="text-ink" />
      </div>
      <p className="font-num text-xs text-brand uppercase tracking-widest mb-1">
        Payment successful
      </p>
      <h1 className="font-display text-2xl font-bold mb-1">{shop?.name}</h1>
      <p className="text-ink/50 text-xs mb-6">
        {new Date(order.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>

      <div className="relative">
        <QrCodeDisplay value={receipt.receiptToken} />
        {isUsed && (
          <div className="absolute inset-0 bg-paper/90 rounded-2xl flex items-center justify-center">
            <span className="font-display font-bold text-coral text-sm rotate-[-8deg] border-2 border-coral px-3 py-1 rounded-lg">
              USED
            </span>
          </div>
        )}
      </div>
      <p className="font-num text-[10px] text-ink/30 mt-2 tracking-widest">
        {receipt.receiptToken.slice(0, 16)}…
      </p>

      <div className="w-full bg-mist rounded-[var(--radius-card)] p-5 mt-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1.5">
            <span className="text-ink/70">
              {item.name} × {item.quantity}
            </span>
            <span className="font-num">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-display font-bold pt-3 mt-2 border-t border-line">
          <span>Total</span>
          <span className="font-num">₹{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-center text-ink/40 text-xs px-6 my-6">
        Show this QR to security at the exit. It can only be used once.
      </p>

      <Button variant="secondary" onClick={() => navigate(`/shop/${shopId}`)}>
        Done
      </Button>
    </div>
  );
}
