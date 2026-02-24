import React from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  const base =
    "h-11 px-6 rounded-full font-medium transition-colors focus:outline-none";

  const variants: Record<Variant, string> = {
    primary:
      "bg-brand-accent hover:bg-brand-accentHover text-white",
    outline:
      "border border-subtle bg-transparent hover:bg-brand-surface text-white",
    ghost:
      "bg-transparent hover:bg-brand-surface text-white"
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    />
  );
}
