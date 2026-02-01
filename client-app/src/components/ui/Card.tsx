import type { CSSProperties, ReactNode, HTMLAttributes } from "react";
import { components } from "@/styles";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  variant?: "default" | "muted";
};

export function Card({
  children,
  style,
  className = "",
  variant = "default",
  ...rest
}: CardProps) {
  const baseStyle =
    variant === "muted" ? components.card.muted : components.card.base;

  return (
    <div className={className} style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </div>
  );
}
