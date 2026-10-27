import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShopById } from "../services/shopService";
import type { Shop } from "../types/shop";
import Button from "../components/Button";

export default function ShopLanding() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "not-found">(
    "loading",
  );

  useEffect(() => {
    if (!shopId) return;

    let cancelled = false;

    getShopById(shopId).then((result) => {
      if (cancelled) return;

      if (result) {
        setShop(result);
        setStatus("found");
      } else {
        setStatus("not-found");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-mist">
          <span className="scan-line" />
        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 text-center">
        <p className="font-num text-xs text-coral uppercase tracking-widest mb-3">
          Store not found
        </p>
        <h1 className="font-display text-2xl font-bold mb-2">
          This QR doesn't match a store
        </h1>
        <p className="text-ink/60 text-sm max-w-xs">
          Ask staff for help, or scan the QueueLess code at the store entrance
          again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand text-paper font-display font-bold text-2xl flex items-center justify-center mb-6">
          {shop!.name.charAt(0)}
        </div>

        <p className="font-num text-xs text-brand uppercase tracking-widest mb-2">
          Welcome to
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight mb-3">
          {shop!.name}
        </h1>
        {shop!.tagline && (
          <p className="text-ink/60 text-base">{shop!.tagline}</p>
        )}
      </div>

      <div className="px-6 pb-10">
        <Button onClick={() => navigate(`/shop/${shop!.id}/scan`)}>
          Start Shopping
        </Button>
        <p className="text-center text-ink/40 text-xs mt-4 font-num tracking-wide">
          Scan · Pay · Verify · Go
        </p>

        {/* Demo-only shortcuts. In a real deployment, staff and store
            owners would be given these URLs directly, not linked here. */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate(`/shop/${shop!.id}/verify`)}
            className="text-ink/30 text-xs underline"
          >
            Security check-in
          </button>
          <button
            onClick={() => navigate(`/shop/${shop!.id}/owner`)}
            className="text-ink/30 text-xs underline"
          >
            Store dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
