import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

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
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={onView}
          className="fixed bottom-6 left-6 right-6 bg-ink text-paper rounded-2xl py-4 px-5 flex items-center justify-between shadow-xl active:scale-[0.98] transition-transform"
        >
          <span className="flex items-center gap-2 font-display font-bold">
            <ShoppingBag size={18} className="text-lime" />
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          <span className="font-num font-bold text-lime">₹{totalAmount.toFixed(2)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
