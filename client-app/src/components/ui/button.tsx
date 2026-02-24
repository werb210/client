import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-medium transition-colors h-11 px-6";

  const styles =
    variant === "primary"
      ? "bg-brand-accent hover:bg-brand-accentHover text-white"
      : "border border-white/20 text-white hover:bg-white/10";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
