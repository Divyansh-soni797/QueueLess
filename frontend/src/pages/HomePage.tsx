
import { useNavigate } from "react-router-dom";
import { ScanLine, PlusCircle, Store, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="px-6 py-5 border-b border-line flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand text-paper flex items-center justify-center">
          <Store size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">QueueLess</h1>
          <p className="text-xs text-ink/50">Scan. Shop. Go.</p>
        </div>
      </header>

      <section className="flex-1 max-w-xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <p className="font-num text-xs uppercase tracking-widest text-brand mb-3">
          Welcome to QueueLess
        </p>

        <h2 className="font-display text-4xl font-bold leading-tight mb-4">
          Shopping without the queue.
        </h2>

        <p className="text-ink/60 mb-8">
          Scan your store's QR code to start shopping, pay, and verify your
          receipt at the exit.
        </p>

        <button
          onClick={() => navigate("/scan-store")}
          className="w-full bg-brand text-paper rounded-2xl p-5 flex items-center gap-4 text-left"
        >
          <ScanLine size={30} />
          <span>
            <span className="block font-display font-bold text-lg">
              Scan Store QR
            </span>
            <span className="block text-sm opacity-80">
              Enter a store and start shopping
            </span>
          </span>
        </button>

        <button
          onClick={() => navigate("/add-store")}
          className="w-full mt-4 border border-line rounded-2xl p-5 flex items-center gap-4 text-left"
        >
          <PlusCircle size={30} />
          <span>
            <span className="block font-display font-bold text-lg">
              Add a Store
            </span>
            <span className="block text-sm text-ink/60">
              Register your shop on QueueLess
            </span>
          </span>
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-ink/40 mt-8">
          <ShieldCheck size={16} />
          Secure, store-specific receipt verification
        </div>
      </section>

      <footer className="text-center text-xs text-ink/40 px-6 py-5">
        QueueLess · Scan · Pay · Verify · Go
      </footer>
    </main>
  );
}
