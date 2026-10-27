import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "w-full py-4 px-6 rounded-2xl font-display font-bold text-base tracking-tight transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";

  const styles =
    variant === "primary"
      ? "bg-ink text-lime hover:bg-brand-dark"
      : "bg-mist text-ink border border-line hover:bg-line";

  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
