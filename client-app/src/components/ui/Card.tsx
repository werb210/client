import classNames from "classnames";
import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ className?: string }>;

export function Card({ className, children }: CardProps) {
  return (
    <div className={classNames("rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}
