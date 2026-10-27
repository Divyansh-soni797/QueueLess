import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "../types/product";

export default function ProductFoundCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-mist rounded-[var(--radius-card)] p-5 flex items-center gap-4"
    >
      <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-display font-bold text-lg shrink-0">
        {product.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-lg truncate">{product.name}</p>
        <p className="font-num text-ink/60 text-sm">₹{product.price.toFixed(2)}</p>
      </div>
      <button
        onClick={onAdd}
        className="w-11 h-11 rounded-full bg-ink text-lime flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        aria-label={`Add ${product.name} to cart`}
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}
