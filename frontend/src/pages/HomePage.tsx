
import { useNavigate } from "react-router-dom";
import { ScanLine, PlusCircle, Store, ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen min-h-dvh bg-paper text-ink flex flex-col">
      <header className="w-full border-b border-line safe-area-top">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand text-paper sm:h-11 sm:w-11">
            <Store size={23} />
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold sm:text-2xl">
              QueueLess
            </h1>
            <p className="text-xs text-ink/50">Scan. Shop. Go.</p>
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
        <div className="mx-auto w-full max-w-xl">
          <p className="mb-3 font-num text-[11px] uppercase tracking-[0.18em] text-brand sm:text-xs">
            Welcome to QueueLess
          </p>

          <h2 className="mb-4 max-w-lg font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Shopping without the queue.
          </h2>

          <p className="mb-7 max-w-lg text-sm leading-6 text-ink/60 sm:mb-8 sm:text-base sm:leading-7">
            Scan your store&apos;s QR code to start shopping, pay, and verify
            your receipt at the exit.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/scan-store")}
              className="flex min-h-20 w-full items-center gap-4 rounded-2xl bg-brand p-4 text-left text-paper transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <ScanLine size={26} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold sm:text-lg">
                  Scan Store QR
                </span>
                <span className="mt-1 block text-xs leading-5 opacity-80 sm:text-sm">
                  Enter a store and start shopping
                </span>
              </span>

              <ArrowRight size={20} className="shrink-0 opacity-80" />
            </button>

            <button
              onClick={() => navigate("/add-store")}
              className="flex min-h-20 w-full items-center gap-4 rounded-2xl border border-line bg-paper p-4 text-left transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist text-brand">
                <PlusCircle size={26} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold sm:text-lg">
                  Add a Store
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink/60 sm:text-sm">
                  Register your shop on QueueLess
                </span>
              </span>

              <ArrowRight size={20} className="shrink-0 text-ink/40" />
            </button>
          </div>

          <div className="mt-7 flex items-start justify-center gap-2 text-center text-xs leading-5 text-ink/50 sm:mt-8">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <span>Secure, store-specific receipt verification</span>
          </div>
        </div>
      </section>

      <footer className="safe-area-bottom border-t border-line px-4 py-4 text-center text-xs text-ink/40 sm:py-5">
        QueueLess <span className="mx-1">·</span> Scan{" "}
        <span className="mx-1">·</span> Pay{" "}
        <span className="mx-1">·</span> Verify <span className="mx-1">·</span> Go
      </footer>
    </main>
  );
}
