
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
      className="flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-card)] bg-mist p-3 sm:gap-4 sm:p-5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-display text-lg font-bold text-brand sm:h-14 sm:w-14">
        {product.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="break-words font-display text-base font-bold leading-snug sm:text-lg">
          {product.name}
        </p>

        <p className="mt-1 font-num text-sm text-ink/60">
          ₹{product.price.toFixed(2)}
        </p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-lime transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:h-12 sm:w-12"
        aria-label={`Add ${product.name} to cart`}
      >
        <Plus size={21} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}
