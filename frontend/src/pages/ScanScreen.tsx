
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, Keyboard } from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import ProductFoundCard from "../components/ProductFoundCard";
import CartBar from "../components/CartBar";
import Button from "../components/Button";
import { findByBarcode } from "../services/productService";
import { useCart } from "../context/useCart";
import type { Product } from "../types/product";

const DEMO_BARCODES = [
  { label: "Classic White Tee", code: "8901030794412" },
  { label: "Slim Fit Jeans", code: "8901030794429" },
  { label: "Cotton Hoodie", code: "8901030794436" },
  { label: "Canvas Sneakers", code: "8901030794443" },
  { label: "Formal Shirt", code: "8901030794444" },
];

export default function ScanScreen() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { addProduct, itemCount, totalAmount } = useCart();

  const [found, setFound] = useState<Product | null>(null);
  const [status, setStatus] = useState<"idle" | "looking-up" | "not-found">("idle");
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastCode, setLastCode] = useState<string | null>(null);

  async function handleDetected(code: string) {
    const normalizedCode = code.trim();

    if (
      !shopId ||
      !normalizedCode ||
      status === "looking-up" ||
      normalizedCode === lastCode
    ) {
      return;
    }

    setLastCode(normalizedCode);
    setStatus("looking-up");

    try {
      const product = await findByBarcode(shopId, normalizedCode);

      if (product) {
        setFound(product);
        setStatus("idle");
      } else {
        setFound(null);
        setStatus("not-found");
        setTimeout(() => setStatus("idle"), 1800);
      }
    } catch (error) {
      console.error("Product lookup failed:", error);
      setFound(null);
      setStatus("not-found");
      setTimeout(() => setStatus("idle"), 1800);
    }
  }

  function handleAdd() {
    if (!found) return;

    addProduct(found);
    setFound(null);
    setLastCode(null);
    setManualCode("");
  }

  return (
    <main className="min-h-screen min-h-dvh bg-paper px-4 pb-36 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-5 flex items-center gap-3 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate(`/shop/${shopId}`)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist transition-colors hover:bg-line"
            aria-label="Back to store"
          >
            <ChevronLeft size={21} />
          </button>

          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold sm:text-2xl">
              Scan a product
            </h1>
            <p className="mt-0.5 text-xs text-ink/50 sm:text-sm">
              Scan the barcode to add an item to your cart.
            </p>
          </div>
        </header>

        {!manualMode && (
          <BarcodeScanner
            onDetected={handleDetected}
            paused={!!found}
          />
        )}

        {manualMode && (
          <form
            className="flex w-full flex-col items-center gap-4 rounded-3xl bg-mist p-4 sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              if (manualCode.trim()) {
                void handleDetected(manualCode.trim());
              }
            }}
          >
            <Keyboard size={28} className="text-brand" />

            <p className="text-center text-sm text-ink/60">
              Enter the barcode printed on the product.
            </p>

            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="Enter barcode number"
              aria-label="Product barcode"
              autoComplete="off"
              inputMode="numeric"
              className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 py-3 text-center font-num text-base outline-none focus:border-brand"
            />

            <Button
              type="submit"
              disabled={!manualCode.trim() || status === "looking-up"}
            >
              {status === "looking-up" ? "Looking up..." : "Look up product"}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setManualMode((mode) => !mode)}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-mist"
        >
          <Keyboard size={17} />
          {manualMode ? "Use camera instead" : "Enter barcode manually"}
        </button>

        {status === "looking-up" && !manualMode && (
          <p className="mt-3 text-center text-sm text-brand" role="status">
            Looking up product...
          </p>
        )}

        {status === "not-found" && (
          <p className="mt-3 text-center text-sm text-coral" role="status">
            No product found for that barcode. Try again.
          </p>
        )}

        <div className="mt-5">
          <AnimatePresence mode="wait">
            {found && (
              <ProductFoundCard
                key={found.id}
                product={found}
                onAdd={handleAdd}
              />
            )}
          </AnimatePresence>
        </div>

        {shopId === "demo" && (
          <section className="mt-7 border-t border-line pt-5 sm:mt-8">
            <p className="mb-3 font-num text-xs uppercase tracking-widest text-ink/40">
              Try the demo
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {DEMO_BARCODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => void handleDetected(item.code)}
                  disabled={status === "looking-up"}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-line bg-mist px-3 py-2 text-center text-xs font-medium leading-5 transition-colors hover:bg-line disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <CartBar
        itemCount={itemCount}
        totalAmount={totalAmount}
        onView={() => navigate(`/shop/${shopId}/cart`)}
      />
    </main>
  );
}
