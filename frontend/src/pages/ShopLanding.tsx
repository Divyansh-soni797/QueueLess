
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShopById } from "../services/shopService";
import type { Shop } from "../types/shop";
import Button from "../components/Button";
import { Store, ShieldCheck, ArrowRight } from "lucide-react";

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

    getShopById(shopId)
      .then((result) => {
        if (cancelled) return;

        if (result) {
          setShop(result);
          setStatus("found");
        } else {
          setStatus("not-found");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("not-found");
      });

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen min-h-dvh items-center justify-center bg-paper px-4">
        <div
          className="relative h-20 w-20 overflow-hidden rounded-full bg-mist sm:h-24 sm:w-24"
          role="status"
          aria-label="Loading store"
        >
          <span className="scan-line" />
        </div>
      </main>
    );
  }

  if (status === "not-found" || !shop) {
    return (
      <main className="flex min-h-screen min-h-dvh flex-col items-center justify-center bg-paper px-5 py-10 text-center">
        <p className="mb-3 font-num text-xs uppercase tracking-widest text-coral">
          Store not found
        </p>

        <h1 className="mb-3 max-w-md font-display text-2xl font-bold leading-tight sm:text-3xl">
          This QR doesn&apos;t match a store
        </h1>

        <p className="max-w-xs text-sm leading-6 text-ink/60 sm:text-base">
          Ask staff for help, or scan the QueueLess code at the store entrance
          again.
        </p>

        <button
          onClick={() => navigate("/scan-store")}
          className="mt-6 min-h-12 rounded-xl bg-brand px-5 py-3 font-semibold text-paper"
        >
          Scan a store QR
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen min-h-dvh flex-col bg-paper">
      <header className="flex items-center gap-3 border-b border-line px-4 py-4 safe-area-top sm:px-6 sm:py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-paper">
          <Store size={21} />
        </div>

        <div className="min-w-0">
          <p className="font-display text-lg font-bold">QueueLess</p>
          <p className="text-xs text-ink/50">Scan. Shop. Go.</p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-12 text-center sm:px-8 sm:py-16">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand font-display text-3xl font-bold text-paper shadow-sm sm:mb-8 sm:h-24 sm:w-24 sm:text-4xl">
          {shop.name.charAt(0).toUpperCase()}
        </div>

        <p className="mb-2 font-num text-xs uppercase tracking-[0.18em] text-brand">
          Welcome to
        </p>

        <h1 className="mb-3 max-w-full break-words font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {shop.name}
        </h1>

        {shop.tagline && (
          <p className="max-w-md break-words text-sm leading-6 text-ink/60 sm:text-base sm:leading-7">
            {shop.tagline}
          </p>
        )}

        <div className="mt-8 w-full max-w-sm sm:mt-10">
          <Button onClick={() => navigate(`/shop/${shop.id}/scan`)}>
            <span className="inline-flex items-center justify-center gap-2">
              Start Shopping
              <ArrowRight size={18} />
            </span>
          </Button>

          <p className="mt-4 font-num text-[10px] tracking-wide text-ink/40 sm:text-xs">
            Scan <span className="mx-1">·</span> Pay{" "}
            <span className="mx-1">·</span> Verify{" "}
            <span className="mx-1">·</span> Go
          </p>
        </div>
      </section>

      <footer className="safe-area-bottom border-t border-line px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center sm:gap-6">
          <button
            onClick={() => navigate(`/shop/${shop.id}/verify`)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm text-ink/60 transition-colors hover:bg-mist hover:text-ink"
          >
            <ShieldCheck size={17} />
            Security check-in
          </button>

          <button
            onClick={() => navigate(`/shop/${shop.id}/owner`)}
            className="min-h-11 rounded-xl px-4 text-sm text-ink/60 transition-colors hover:bg-mist hover:text-ink"
          >
            Store dashboard
          </button>
        </div>
      </footer>
    </main>
  );
}
