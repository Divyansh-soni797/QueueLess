
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Keyboard, Store } from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import Button from "../components/Button";

export default function ScanStoreScreen() {
  const navigate = useNavigate();
  const [manualMode, setManualMode] = useState(false);
  const [storeCode, setStoreCode] = useState("");
  const [error, setError] = useState("");

  function openStore(value: string) {
    const input = value.trim();
    if (!input) return;

    let shopId = input;

    try {
      if (/^https?:\/\//i.test(input)) {
        const url = new URL(input);
        const match = url.pathname.match(/^\/shop\/([^/]+)\/?$/);

        if (!match) {
          setError("Invalid store QR. Please scan a QueueLess store QR.");
          return;
        }

        shopId = decodeURIComponent(match[1]);
      } else if (input.includes("/") || input.includes("?")) {
        setError("Enter a valid store ID or scan a store QR.");
        return;
      }
    } catch {
      setError("Could not read this store QR.");
      return;
    }

    setError("");
    navigate(`/shop/${encodeURIComponent(shopId)}`);
  }

  return (
    <main className="min-h-screen bg-paper px-5 pt-5 pb-10">
      <header className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full bg-mist flex items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold">Scan Store QR</h1>
      </header>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4">
            <Store size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Find your store
          </h2>
          <p className="text-ink/60 text-sm">
            Scan the store's QueueLess QR code to start shopping.
          </p>
        </div>

        {!manualMode && (
          <BarcodeScanner onDetected={openStore} />
        )}

        {manualMode && (
          <div className="rounded-3xl bg-mist p-5">
            <label className="block text-sm mb-2">Store ID or QR URL</label>
            <input
              value={storeCode}
              onChange={(event) => {
                setStoreCode(event.target.value);
                setError("");
              }}
              placeholder="e.g. demo"
              className="w-full bg-paper rounded-xl py-3 px-4 border border-line outline-none focus:border-brand"
            />
            <Button
              onClick={() => openStore(storeCode)}
              disabled={!storeCode.trim()}
            >
              Open Store
            </Button>
          </div>
        )}

        <button
          onClick={() => {
            setManualMode((current) => !current);
            setError("");
          }}
          className="w-full flex items-center justify-center gap-2 text-ink/60 text-sm mt-4 py-3"
        >
          <Keyboard size={16} />
          {manualMode ? "Use camera instead" : "Enter store ID manually"}
        </button>

        {error && (
          <p className="text-center text-coral text-sm mt-3">{error}</p>
        )}

        <div className="mt-6 p-4 rounded-2xl border border-line">
          <p className="text-sm font-semibold mb-1">Testing the demo</p>
          <p className="text-sm text-ink/60 mb-3">
            You can open the existing demo store without a QR code.
          </p>
          <Button onClick={() => openStore("demo")}>
            Open Demo Store
          </Button>
        </div>
      </div>
    </main>
  );
}
