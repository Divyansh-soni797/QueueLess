import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CheckCircle2, XCircle, Keyboard } from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import Button from "../components/Button";
import { verifyReceipt } from "../services/receiptService";
import type { VerifyResult } from "../services/receiptService";

const REASON_TEXT: Record<string, string> = {
  NOT_FOUND: "This QR doesn't match a QueueLess receipt.",
  WRONG_SHOP: "This receipt belongs to a different store.",
  PAYMENT_NOT_CONFIRMED: "Payment on this order was never confirmed.",
  ALREADY_USED: "This receipt has already been used to exit.",
};

export default function SecurityVerifyScreen() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<VerifyResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualToken, setManualToken] = useState("");

  async function handleScan(token: string) {
    if (!shopId || checking || result) return;
    setChecking(true);
    try {
      const res = await verifyReceipt(token, shopId);
      setResult(res);
    } finally {
      setChecking(false);
    }
  }

  function reset() {
    setResult(null);
    setManualToken("");
  }

  if (result) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-6 text-center ${
          result.valid ? "bg-lime" : "bg-coral"
        }`}
      >
        {result.valid ? (
          <CheckCircle2 size={72} className="text-ink mb-5" />
        ) : (
          <XCircle size={72} className="text-paper mb-5" />
        )}
        <h1
          className={`font-display font-bold text-3xl mb-2 ${
            result.valid ? "text-ink" : "text-paper"
          }`}
        >
          {result.valid ? "VALID" : "NOT VALID"}
        </h1>
        <p className={`text-sm mb-10 ${result.valid ? "text-ink/70" : "text-paper/80"}`}>
          {result.valid
            ? "Receipt verified. Customer may exit."
            : REASON_TEXT[result.reason ?? ""] ?? "This receipt could not be verified."}
        </p>
        <button
          onClick={reset}
          className={`w-full max-w-xs py-4 rounded-2xl font-display font-bold ${
            result.valid ? "bg-ink text-lime" : "bg-paper text-coral"
          }`}
        >
          Scan next receipt
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col px-5 pt-5 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(`/shop/${shopId}`)}
          className="w-9 h-9 rounded-full bg-mist flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold">Verify receipt</h1>
          <p className="text-ink/50 text-xs">Security checkpoint</p>
        </div>
      </div>

      {!manualMode && <BarcodeScanner onDetected={handleScan} paused={checking} />}

      {manualMode && (
        <div className="w-full aspect-square rounded-3xl bg-mist flex flex-col items-center justify-center gap-4 px-8">
          <input
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste receipt token"
            className="w-full text-center font-num text-sm bg-paper rounded-xl py-3 px-4 border border-line focus:border-brand outline-none"
          />
          <Button
            onClick={() => manualToken.trim() && handleScan(manualToken.trim())}
            disabled={!manualToken.trim() || checking}
          >
            {checking ? "Checking…" : "Verify"}
          </Button>
        </div>
      )}

      <button
        onClick={() => setManualMode((m) => !m)}
        className="flex items-center justify-center gap-2 text-ink/60 text-sm mt-4 py-2"
      >
        <Keyboard size={16} />
        {manualMode ? "Use camera instead" : "Enter token manually"}
      </button>
    </div>
  );
}
