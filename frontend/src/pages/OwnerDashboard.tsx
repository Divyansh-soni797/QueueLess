import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Pencil, Check, X } from "lucide-react";
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

export default function OwnerDashboard() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("products");

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) return;
    refreshAll(shopId);
  }, [shopId]);

  function refreshAll(id: string) {
    getShopById(id).then(setShop);
    listProducts(id).then(setProducts);
    listOrdersForShop(id).then(setOrders);
  }

  async function handleAddProduct(data: { name: string; price: number; barcode: string }) {
    if (!shopId) return;
    setFormError(null);
    try {
      const product = await createProduct(shopId, data);
      setProducts((prev) => [...prev, product]);
      setShowAddForm(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't add product.");
    }
  }

  async function handleUpdateProduct(id: string, data: { name: string; price: number; barcode: string }) {
    setFormError(null);
    try {
      const updated = await updateProduct(id, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't update product.");
    }
  }

  async function handleDeleteProduct(id: string) {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleUpiSave(upiId: string) {
    if (!shopId) return;
    try {
      const updated = await updateShop(shopId, { upiId });
      setShop(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't update UPI ID.");
    }
  }

  return (
    <div className="min-h-screen bg-paper px-5 pt-5 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(`/shop/${shopId}`)}
          className="w-9 h-9 rounded-full bg-mist flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold">Store dashboard</h1>
          <p className="text-ink/50 text-xs">{shop?.name}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-mist rounded-full p-1">
        {(["products", "orders", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-ink text-lime" : "text-ink/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div>
          {formError && <p className="text-coral text-sm mb-3">{formError}</p>}

          {products.map((p) =>
            editingId === p.id ? (
              <ProductForm
                key={p.id}
                initial={p}
                onCancel={() => setEditingId(null)}
                onSubmit={(data) => handleUpdateProduct(p.id, data)}
              />
            ) : (
              <div
                key={p.id}
                className="bg-mist rounded-2xl p-4 flex items-center gap-3 mb-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="font-num text-xs text-ink/50">
                    ₹{p.price.toFixed(2)} · {p.barcode}
                  </p>
                </div>
                <button
                  onClick={() => setEditingId(p.id)}
                  className="w-8 h-8 flex items-center justify-center text-ink/60"
                  aria-label={`Edit ${p.name}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="w-8 h-8 flex items-center justify-center text-coral"
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ),
          )}

          {showAddForm ? (
            <ProductForm onCancel={() => setShowAddForm(false)} onSubmit={handleAddProduct} />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-line text-ink/50 font-medium mt-2"
            >
              <Plus size={16} />
              Add product
            </button>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div>
          {orders.length === 0 && (
            <p className="text-ink/50 text-sm text-center py-10">No orders yet.</p>
          )}
          {orders.map((o) => (
            <div key={o.id} className="bg-mist rounded-2xl p-4 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-num text-xs text-ink/50">
                  {new Date(o.createdAt).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
                <StatusPill status={o.paymentStatus} />
              </div>
              <p className="font-num font-bold">₹{o.totalAmount.toFixed(2)}</p>
              <p className="text-ink/50 text-xs mt-1">
                {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "settings" && shop && (
        <SettingsForm shop={shop} onSave={handleUpiSave} />
      )}
    </div>
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
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function ProductForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Product;
  onSubmit: (data: { name: string; price: number; barcode: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");

  return (
    <div className="bg-mist rounded-2xl p-4 mb-2 flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product name"
        className="bg-paper rounded-xl py-2.5 px-3 border border-line outline-none focus:border-brand text-sm"
      />
      <div className="flex gap-2">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          inputMode="decimal"
          className="flex-1 bg-paper rounded-xl py-2.5 px-3 border border-line outline-none focus:border-brand text-sm font-num"
        />
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Barcode"
          inputMode="numeric"
          className="flex-1 bg-paper rounded-xl py-2.5 px-3 border border-line outline-none focus:border-brand text-sm font-num"
        />
      </div>
      <div className="flex gap-2 mt-1">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-paper border border-line text-sm"
        >
          <X size={14} /> Cancel
        </button>
        <button
          onClick={() => {
            const parsedPrice = parseFloat(price);
            if (name.trim() && barcode.trim() && !isNaN(parsedPrice) && parsedPrice > 0) {
              onSubmit({ name: name.trim(), price: parsedPrice, barcode: barcode.trim() });
            }
          }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-ink text-lime text-sm font-medium"
        >
          <Check size={14} /> Save
        </button>
      </div>
    </div>
  );
}

function SettingsForm({ shop, onSave }: { shop: Shop; onSave: (upiId: string) => void }) {
  const [upiId, setUpiId] = useState(shop.upiId);

  return (
    <div className="bg-mist rounded-2xl p-4 flex flex-col gap-3">
      <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
        Store UPI ID
      </label>
      <input
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        className="bg-paper rounded-xl py-2.5 px-3 border border-line outline-none focus:border-brand text-sm font-num"
      />
      <Button onClick={() => onSave(upiId)}>Save changes</Button>
    </div>
  );
}
