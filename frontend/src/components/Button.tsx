
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3.5 font-display text-base font-bold tracking-tight transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-6 sm:py-4";

  const styles =
    variant === "primary"
      ? "bg-ink text-lime hover:bg-brand-dark"
      : "border border-line bg-mist text-ink hover:bg-line";

  return (
    <button
      type={type}
      className={`${base} ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
