
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { getOrder } from "../services/orderService";
import { getReceiptByOrderId } from "../services/receiptService";
import { getShopById } from "../services/shopService";
import QrCodeDisplay from "../components/QrCodeDisplay";
import Button from "../components/Button";
import type { Order } from "../types/order";
import type { Receipt } from "../types/receipt";
import type { Shop } from "../types/shop";

export default function ReceiptScreen() {
  const { shopId, orderId } = useParams<{
    shopId: string;
    orderId: string;
  }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !shopId) return;

    let active = true;

    Promise.all([
      getOrder(orderId),
      getReceiptByOrderId(orderId),
      getShopById(shopId),
    ])
      .then(([loadedOrder, loadedReceipt, loadedShop]) => {
        if (!active) return;

        setOrder(loadedOrder);
        setReceipt(loadedReceipt);
        setShop(loadedShop);
      })
      .catch(() => {
        if (active) {
          setError("Couldn't load your receipt. Please refresh and try again.");
        }
      });

    return () => {
      active = false;
    };
  }, [orderId, shopId]);

  if (!order || !receipt) {
    return (
      <main className="flex min-h-screen min-h-dvh items-center justify-center bg-paper px-5">
        {error ? (
          <div className="max-w-sm text-center">
            <p className="text-sm leading-6 text-coral" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 min-h-11 rounded-xl bg-mist px-5 py-3 text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            className="relative h-16 w-16 overflow-hidden rounded-2xl bg-mist"
            role="status"
            aria-label="Loading receipt"
          >
            <span className="scan-line" />
          </div>
        )}
      </main>
    );
  }

  const isUsed = receipt.exitStatus === "USED";

  return (
    <main className="min-h-screen min-h-dvh bg-paper px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lime/30 sm:h-16 sm:w-16">
          <CheckCircle2 size={30} className="text-ink" />
        </div>

        <p className="mb-1 font-num text-xs uppercase tracking-widest text-brand">
          Payment successful
        </p>

        <h1 className="max-w-full break-words text-center font-display text-2xl font-bold sm:text-3xl">
          {shop?.name ?? "Your receipt"}
        </h1>

        <p className="mt-2 mb-6 text-center text-xs text-ink/50 sm:text-sm">
          {new Date(order.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>

        <section className="w-full rounded-3xl border border-line bg-white p-4 text-center sm:p-5">
          <div className="relative mx-auto flex w-full max-w-[280px] justify-center">
            <QrCodeDisplay value={receipt.receiptToken} />

            {isUsed && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-paper/90">
                <span className="rotate-[-8deg] rounded-lg border-2 border-coral px-4 py-2 font-display text-sm font-bold text-coral">
                  USED
                </span>
              </div>
            )}
          </div>

          {isUsed ? (
            <p className="mt-3 text-sm font-semibold text-coral">
              This receipt has already been used.
            </p>
          ) : (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-ink/70">
              <ShieldCheck size={17} className="text-brand" />
              Ready for exit verification
            </p>
          )}

          <p className="mt-2 break-all font-num text-[10px] tracking-wide text-ink/40 sm:text-xs">
            {receipt.receiptToken.slice(0, 16)}…
          </p>
        </section>

        <section className="mt-5 w-full rounded-[var(--radius-card)] bg-mist p-4 sm:p-5">
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

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 font-display font-bold">
            <span>Total</span>
            <span className="shrink-0 font-num">
              ₹{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </section>

        <p className="my-5 max-w-sm px-2 text-center text-xs leading-5 text-ink/50">
          Show this QR to security at the exit. It can only be used once.
        </p>

        <div className="w-full">
          <Button
            variant="secondary"
            onClick={() => navigate(`/shop/${shopId}`)}
          >
            Done
          </Button>
        </div>
      </div>
    </main>
  );
}
