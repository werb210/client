import classNames from "classnames";
import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ title?: string; className?: string }>;

export function Card({ title, className, children }: CardProps) {
  return (
    <div className={classNames("border rounded-lg p-4 bg-white shadow-sm mb-4", className)}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  );
}
