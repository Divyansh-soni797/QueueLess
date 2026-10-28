
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

            setCreatedShop({
                id: shop.id,
                name: shop.name,
            });
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
        <main className="min-h-screen bg-paper px-5 pt-5 pb-10">
            <header className="flex items-center gap-3 mb-8">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="w-9 h-9 rounded-full bg-mist flex items-center justify-center"
                    aria-label="Back"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="font-display text-xl font-bold">Add a Store</h1>
            </header>

            <section className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4">
                        <Store size={32} />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-2">
                        Register your store
                    </h2>
                    <p className="text-sm text-ink/60">
                        Set up your store on QueueLess to start accepting shoppers.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Store name *
                        </label>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. My Fashion Store"
                            maxLength={100}
                            required
                            className="w-full bg-white rounded-xl py-3 px-4 border border-line outline-none focus:border-brand"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            UPI ID *
                        </label>
                        <input
                            value={upiId}
                            onChange={(event) => setUpiId(event.target.value)}
                            placeholder="e.g. store@upi"
                            maxLength={256}
                            required
                            className="w-full bg-white rounded-xl py-3 px-4 border border-line outline-none focus:border-brand"
                        />
                        <p className="text-xs text-ink/50 mt-2">
                            Used to create the store's payment link.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tagline (optional)
                        </label>
                        <input
                            value={tagline}
                            onChange={(event) => setTagline(event.target.value)}
                            placeholder="e.g. Fashion, faster."
                            maxLength={150}
                            className="w-full bg-white rounded-xl py-3 px-4 border border-line outline-none focus:border-brand"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-coral text-sm">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-brand text-white font-semibold py-3 disabled:opacity-50"
                    >
                        {loading ? "Creating store..." : "Create Store"}
                    </button>
                </form>
                {createdShop && (
                    <div className="mt-8 rounded-2xl border border-line bg-white p-6 text-center">
                        <h3 className="font-display text-xl font-bold">
                            {createdShop.name} is ready!
                        </h3>

                        <p className="text-sm text-ink/60 mt-2 mb-5">
                            Customers can scan this QR code to open your store.
                        </p>

                        <div className="inline-block bg-white p-3 rounded-xl border border-line">
                            <QRCodeSVG
                                value={`${window.location.origin}/shop/${encodeURIComponent(createdShop.id)}`}
                                size={220}
                                level="H"
                                includeMargin
                            />
                        </div>

                        <p className="text-xs text-ink/50 mt-4 break-all">
                            Store ID: {createdShop.id}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="w-full mt-5 rounded-xl bg-brand text-white font-semibold py-3"
                        >
                            Print Store QR
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(`/shop/${encodeURIComponent(createdShop.id)}`)}
                            className="w-full mt-3 rounded-xl border border-line font-semibold py-3"
                        >
                            Open Store
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
