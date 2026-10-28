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

// Demo barcodes for the seeded catalog — lets anyone try the flow without
// a physical product on hand. Real deployments would remove this panel.
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
    if (!shopId || status === "looking-up" || code === lastCode) return;

    setLastCode(code);
    setStatus("looking-up");

    try {
      const product = await findByBarcode(shopId, code);

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
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col px-5 pt-5 pb-32">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(`/shop/${shopId}`)}
          className="w-9 h-9 rounded-full bg-mist flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold">Scan a product</h1>
      </div>

      {!manualMode && <BarcodeScanner onDetected={handleDetected} paused={!!found} />}

      {manualMode && (
        <div className="w-full aspect-square rounded-3xl bg-mist flex flex-col items-center justify-center gap-4 px-8">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter barcode number"
            className="w-full text-center font-num text-lg bg-paper rounded-xl py-3 px-4 border border-line focus:border-brand outline-none"
            inputMode="numeric"
          />
          <Button
            onClick={() => manualCode.trim() && handleDetected(manualCode.trim())}
            disabled={!manualCode.trim()}
          >
            Look up product
          </Button>
        </div>
      )}

      <button
        onClick={() => setManualMode((m) => !m)}
        className="flex items-center justify-center gap-2 text-ink/60 text-sm mt-4 py-2"
      >
        <Keyboard size={16} />
        {manualMode ? "Use camera instead" : "Enter barcode manually"}
      </button>

      {status === "not-found" && (
        <p className="text-center text-coral text-sm mt-2">
          No product found for that barcode.
        </p>
      )}

      <div className="mt-5">
        <AnimatePresence mode="wait">
          {found && (
            <ProductFoundCard key={found.id} product={found} onAdd={handleAdd} />
          )}
        </AnimatePresence>
      </div>

      {shopId === "demo" && (
        <div className="mt-8">
          <p className="font-num text-xs text-ink/40 uppercase tracking-widest mb-3">
            Try the demo
          </p>

          <div className="flex flex-wrap gap-2">
            {DEMO_BARCODES.map((d) => (
              <button
                key={d.code}
                onClick={() => handleDetected(d.code)}
                className="text-xs font-medium bg-mist rounded-full px-3 py-2 border border-line active:scale-95 transition-transform"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <CartBar
        itemCount={itemCount}
        totalAmount={totalAmount}
        onView={() => navigate(`/shop/${shopId}/cart`)}
      />
    </div>
  );
}
