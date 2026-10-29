
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Store } from "lucide-react";
import { ApiError } from "../services/api";
import { createShop } from "../services/shopService";
import { QRCodeSVG } from "qrcode.react";

export default function AddStoreScreen() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [tagline, setTagline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdShop, setCreatedShop] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Store name must contain at least 2 characters.");
      return;
    }

    if (!/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      setError("Enter a valid UPI ID, e.g. store@upi.");
      return;
    }

    setLoading(true);

    try {
      const shop = await createShop({
        name: name.trim(),
        upiId: upiId.trim(),
        tagline: tagline.trim(),
      });

      setCreatedShop({ id: shop.id, name: shop.name });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't create the store. Please try again.",
      );
    } finally {
      setLoading(false);
    }
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
            Add a Store
          </h1>
        </header>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-7 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Store size={30} />
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold sm:text-3xl">
              Register your store
            </h2>
            <p className="text-sm leading-6 text-ink/60">
              Set up your store on QueueLess to start accepting shoppers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="store-name" className="mb-2 block text-sm font-medium">
                Store name *
              </label>
              <input
                id="store-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. My Fashion Store"
                maxLength={100}
                autoComplete="organization"
                required
                className="min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-brand"
              />
            </div>

            <div>
              <label htmlFor="store-upi" className="mb-2 block text-sm font-medium">
                UPI ID *
              </label>
              <input
                id="store-upi"
                value={upiId}
                onChange={(event) => setUpiId(event.target.value)}
                placeholder="e.g. store@upi"
                maxLength={256}
                autoComplete="off"
                required
                className="min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-brand"
              />
              <p className="mt-2 text-xs leading-5 text-ink/50">
                Used for the store's payment details.
              </p>
            </div>

            <div>
              <label htmlFor="store-tagline" className="mb-2 block text-sm font-medium">
                Tagline (optional)
              </label>
              <input
                id="store-tagline"
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                placeholder="e.g. Fashion, faster."
                maxLength={150}
                className="min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-brand"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm leading-5 text-coral">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? "Creating store..." : "Create Store"}
            </button>
          </form>

          {createdShop && (
            <div className="mt-8 rounded-2xl border border-line bg-white p-4 text-center sm:p-6">
              <h3 className="break-words font-display text-xl font-bold">
                {createdShop.name} is ready!
              </h3>

              <p className="mb-5 mt-2 text-sm leading-6 text-ink/60">
                Customers can scan this QR code to open your store.
              </p>

              <div className="mx-auto w-full max-w-[260px] rounded-xl border border-line bg-white p-3">
                <QRCodeSVG
                  value={`${window.location.origin}/shop/${encodeURIComponent(createdShop.id)}`}
                  size={220}
                  level="H"
                  includeMargin
                  className="h-auto w-full"
                />
              </div>

              <p className="mt-4 break-all text-xs text-ink/50">
                Store ID: {createdShop.id}
              </p>

              <button
                type="button"
                onClick={() => window.print()}
                className="mt-5 min-h-12 w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white"
              >
                Print Store QR
              </button>

              <button
                type="button"
                onClick={() => navigate(`/shop/${encodeURIComponent(createdShop.id)}`)}
                className="mt-3 min-h-12 w-full rounded-xl border border-line px-4 py-3 font-semibold"
              >
                Open Store
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
