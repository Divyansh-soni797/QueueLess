
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function CartBar({
  itemCount,
  totalAmount,
  onView,
}: {
  itemCount: number;
  totalAmount: number;
  onView: () => void;
}) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          type="button"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={onView}
          aria-label={`View cart with ${itemCount} items, total ₹${totalAmount.toFixed(2)}`}
          className="fixed inset-x-0 bottom-0 z-40 w-full safe-area-bottom px-3 pb-3 sm:inset-x-6 sm:bottom-4 sm:w-auto sm:px-0 sm:pb-0 md:left-1/2 md:right-auto md:w-full md:max-w-xl md:-translate-x-1/2"
        >
          <span className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-4 text-paper shadow-xl sm:px-5">
            <span className="flex min-w-0 items-center gap-2 font-display font-bold">
              <ShoppingBag size={19} className="shrink-0 text-lime" />
              <span className="truncate">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-2 font-num text-sm font-bold text-lime sm:text-base">
              ₹{totalAmount.toFixed(2)}
              <ArrowRight size={18} />
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
