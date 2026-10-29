
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
    <main className="min-h-screen min-h-dvh bg-paper px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-7 flex items-center gap-3 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist"
            aria-label="Back to home"
          >
            <ChevronLeft size={21} />
          </button>
          <h1 className="font-display text-xl font-bold sm:text-2xl">
            Scan Store QR
          </h1>
        </header>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Store size={30} />
            </div>

            <h2 className="mb-2 font-display text-2xl font-bold sm:text-3xl">
              Find your store
            </h2>
            <p className="text-sm leading-6 text-ink/60">
              Scan the store's QueueLess QR code to start shopping.
            </p>
          </div>

          {!manualMode && <BarcodeScanner onDetected={openStore} />}

          {manualMode && (
            <form
              className="rounded-3xl bg-mist p-4 sm:p-5"
              onSubmit={(event) => {
                event.preventDefault();
                openStore(storeCode);
              }}
            >
              <label htmlFor="store-code" className="mb-2 block text-sm font-medium">
                Store ID or QR URL
              </label>

              <input
                id="store-code"
                value={storeCode}
                onChange={(event) => {
                  setStoreCode(event.target.value);
                  setError("");
                }}
                placeholder="e.g. demo"
                autoComplete="off"
                className="mb-4 min-h-12 w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
              />

              <Button type="submit" disabled={!storeCode.trim()}>
                Open Store
              </Button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setManualMode((current) => !current);
              setError("");
            }}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-ink/60"
          >
            <Keyboard size={17} />
            {manualMode ? "Use camera instead" : "Enter store ID manually"}
          </button>

          {error && (
            <p role="alert" className="mt-3 text-center text-sm leading-5 text-coral">
              {error}
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-line p-4 sm:p-5">
            <p className="mb-1 text-sm font-semibold">Testing the demo</p>
            <p className="mb-3 text-sm leading-5 text-ink/60">
              Open the existing demo store without scanning a QR code.
            </p>
            <Button onClick={() => openStore("demo")}>
              Open Demo Store
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
