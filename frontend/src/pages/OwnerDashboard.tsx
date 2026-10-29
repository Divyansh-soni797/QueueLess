
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Package,
  ShoppingBag,
  Settings,
} from "lucide-react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { listOrdersForShop } from "../services/orderService";
import { getShopById, updateShop } from "../services/shopService";
import Button from "../components/Button";
import { ApiError } from "../services/api";
import type { Product } from "../types/product";
import type { Order } from "../types/order";
import type { Shop } from "../types/shop";

type Tab = "products" | "orders" | "settings";

type ProductData = {
  name: string;
  price: number;
  barcode: string;
};

export default function OwnerDashboard() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("products");
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function refreshAll(id: string) {
    setLoading(true);
    setPageError(null);

    try {
      const [shopData, productData, orderData] = await Promise.all([
        getShopById(id),
        listProducts(id),
        listOrdersForShop(id),
      ]);

      setShop(shopData);
      setProducts(productData);
      setOrders(orderData);
    } catch (err) {
      setPageError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load the store dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      setPageError("Store ID is missing.");
      return;
    }

    void refreshAll(shopId);
  }, [shopId]);

  async function handleAddProduct(data: ProductData) {
    if (!shopId || saving) return;

    setFormError(null);
    setSaving(true);

    try {
      const product = await createProduct(shopId, data);
      setProducts((prev) => [...prev, product]);
      setShowAddForm(false);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Couldn't add product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateProduct(id: string, data: ProductData) {
    if (saving) return;

    setFormError(null);
    setSaving(true);

    try {
      const updated = await updateProduct(id, data);
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updated : product)),
      );
      setEditingId(null);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Couldn't update product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmed) return;

    setDeletingId(id);
    setFormError(null);

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Couldn't delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpiSave(upiId: string) {
    if (!shopId || saving) return;

    setFormError(null);
    setSaving(true);

    try {
      const updated = await updateShop(shopId, { upiId });
      setShop(updated);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Couldn't update UPI ID.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-dvh bg-paper px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex min-w-0 items-center gap-3 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate(`/shop/${shopId}`)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist transition-colors hover:bg-line"
            aria-label="Back to store"
          >
            <ChevronLeft size={21} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              Store dashboard
            </h1>
            <p className="truncate text-sm text-ink/55">
              {shop?.name ?? "Manage your store"}
            </p>
          </div>
        </header>

        {pageError && (
          <section
            role="alert"
            className="mb-5 rounded-2xl border border-coral/30 bg-coral/10 p-4"
          >
            <p className="text-sm text-coral">{pageError}</p>
            {shopId && (
              <button
                type="button"
                onClick={() => void refreshAll(shopId)}
                className="mt-3 rounded-xl bg-paper px-4 py-2 text-sm font-semibold"
              >
                Try again
              </button>
            )}
          </section>
        )}

        {loading ? (
          <div
            className="rounded-2xl bg-mist px-4 py-12 text-center text-sm text-ink/60"
            role="status"
          >
            Loading dashboard...
          </div>
        ) : (
          <>
            <nav
              aria-label="Dashboard sections"
              className="mb-6 grid grid-cols-3 gap-1 rounded-2xl bg-mist p-1 sm:mb-8 sm:gap-2"
            >
              {(
                [
                  {
                    id: "products",
                    label: "Products",
                    icon: Package,
                  },
                  {
                    id: "orders",
                    label: "Orders",
                    icon: ShoppingBag,
                  },
                  {
                    id: "settings",
                    label: "Settings",
                    icon: Settings,
                  },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={tab === id ? "page" : undefined}
                  className={`flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl px-1.5 py-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-3 sm:text-sm ${
                    tab === id
                      ? "bg-ink text-lime shadow-sm"
                      : "text-ink/65 hover:bg-paper"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                  {id === "products" && (
                    <span className="hidden rounded-full bg-paper/15 px-1.5 text-[10px] sm:inline">
                      {products.length}
                    </span>
                  )}
                  {id === "orders" && (
                    <span className="hidden rounded-full bg-paper/15 px-1.5 text-[10px] sm:inline">
                      {orders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {tab === "products" && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold sm:text-xl">
                      Products
                    </h2>
                    <p className="text-xs text-ink/55 sm:text-sm">
                      {products.length} products in your store
                    </p>
                  </div>

                  {!showAddForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setShowAddForm(true);
                        setEditingId(null);
                      }}
                      className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-sm font-semibold text-lime sm:px-4"
                    >
                      <Plus size={17} />
                      <span>Add product</span>
                    </button>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="mb-3 text-sm text-coral">
                    {formError}
                  </p>
                )}

                {showAddForm && (
                  <ProductForm
                    onCancel={() => {
                      setShowAddForm(false);
                      setFormError(null);
                    }}
                    onSubmit={handleAddProduct}
                    saving={saving}
                  />
                )}

                {products.length === 0 && !showAddForm ? (
                  <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center">
                    <Package className="mx-auto mb-3 text-ink/40" size={30} />
                    <p className="font-semibold">No products yet</p>
                    <p className="mt-1 text-sm text-ink/55">
                      Add your first product to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) =>
                      editingId === product.id ? (
                        <ProductForm
                          key={product.id}
                          initial={product}
                          onCancel={() => {
                            setEditingId(null);
                            setFormError(null);
                          }}
                          onSubmit={(data) =>
                            handleUpdateProduct(product.id, data)
                          }
                          saving={saving}
                        />
                      ) : (
                        <article
                          key={product.id}
                          className="flex min-w-0 items-start gap-2 rounded-2xl bg-mist p-3 sm:items-center sm:gap-4 sm:p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper font-display font-bold">
                            {product.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-words font-semibold leading-snug">
                              {product.name}
                            </p>
                            <p className="mt-1 break-all text-xs text-ink/55">
                              ₹{product.price.toFixed(2)} · {product.barcode}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setFormError(null);
                                setShowAddForm(false);
                                setEditingId(product.id);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-paper"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-coral hover:bg-paper disabled:opacity-50"
                              aria-label={`Delete ${product.name}`}
                            >
                              {deletingId === product.id ? (
                                <span className="text-xs">...</span>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </section>
            )}

            {tab === "orders" && (
              <section>
                <div className="mb-4">
                  <h2 className="font-display text-lg font-bold sm:text-xl">
                    Orders
                  </h2>
                  <p className="text-xs text-ink/55 sm:text-sm">
                    {orders.length} orders received
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-2xl bg-mist px-4 py-10 text-center">
                    <ShoppingBag className="mx-auto mb-3 text-ink/40" size={30} />
                    <p className="font-semibold">No orders yet</p>
                    <p className="mt-1 text-sm text-ink/55">
                      New customer orders will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <article
                        key={order.id}
                        className="min-w-0 rounded-2xl bg-mist p-4 sm:p-5"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-ink/55">
                            {new Date(order.createdAt).toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                          <StatusPill status={order.paymentStatus} />
                        </div>

                        <p className="font-num text-xl font-bold">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>

                        <p className="mt-2 break-words text-sm leading-relaxed text-ink/65">
                          {order.items
                            .map((item) => `${item.name} ×${item.quantity}`)
                            .join(", ")}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === "settings" && shop && (
              <section>
                <div className="mb-4">
                  <h2 className="font-display text-lg font-bold sm:text-xl">
                    Store settings
                  </h2>
                  <p className="text-sm text-ink/55">
                    Update the UPI ID used for your store.
                  </p>
                </div>
                {formError && (
                  <p role="alert" className="mb-3 text-sm text-coral">
                    {formError}
                  </p>
                )}
                <SettingsForm
                  key={shop.id}
                  shop={shop}
                  onSave={handleUpiSave}
                  saving={saving}
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: Order["paymentStatus"] }) {
  const styles: Record<Order["paymentStatus"], string> = {
    SUCCESS: "bg-lime/40 text-ink",
    PENDING: "bg-brand/10 text-brand",
    FAILED: "bg-coral/15 text-coral",
    CANCELLED: "bg-ink/10 text-ink/50",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ProductForm({
  initial,
  onSubmit,
  onCancel,
  saving = false,
}: {
  initial?: Product;
  onSubmit: (data: ProductData) => void | Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPrice = Number(price);

    if (!name.trim() || !barcode.trim()) {
      setValidationError("Enter the product name and barcode.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setValidationError("Enter a valid price greater than zero.");
      return;
    }

    setValidationError(null);
    await onSubmit({
      name: name.trim(),
      price: parsedPrice,
      barcode: barcode.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-3 flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-mist p-3 sm:p-4"
    >
      <h3 className="font-display font-bold">
        {initial ? "Edit product" : "Add product"}
      </h3>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink/65">
        Product name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Classic White Tee"
          autoComplete="off"
          maxLength={120}
          className="w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-3 text-base text-ink outline-none focus:border-brand sm:text-sm"
          required
        />
      </label>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-ink/65">
          Price (₹)
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="799"
            inputMode="decimal"
            type="number"
            min="0.01"
            step="0.01"
            className="w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-3 text-base text-ink outline-none focus:border-brand sm:text-sm"
            required
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-ink/65">
          Barcode
          <input
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="Scan code value"
            inputMode="text"
            autoComplete="off"
            className="w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-3 font-num text-base text-ink outline-none focus:border-brand sm:text-sm"
            required
          />
        </label>
      </div>

      {validationError && (
        <p role="alert" className="text-sm text-coral">
          {validationError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          <X size={15} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-lime disabled:opacity-50"
        >
          <Check size={15} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function SettingsForm({
  shop,
  onSave,
  saving = false,
}: {
  shop: Shop;
  onSave: (upiId: string) => void;
  saving?: boolean;
}) {
  const [upiId, setUpiId] = useState(shop.upiId);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(upiId.trim());
      }}
      className="flex min-w-0 flex-col gap-4 rounded-2xl bg-mist p-4 sm:p-5"
    >
      <label
        htmlFor="store-upi-id"
        className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink/60"
      >
        Store UPI ID
        <input
          id="store-upi-id"
          type="text"
          value={upiId}
          onChange={(event) => setUpiId(event.target.value)}
          placeholder="store@upi"
          autoComplete="off"
          className="w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-3 font-num text-base text-ink outline-none focus:border-brand sm:text-sm"
        />
      </label>

      <Button type="submit" disabled={saving || !upiId.trim()}>
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
