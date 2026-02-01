import type { ReactNode } from "react";
import { components } from "@/styles";

type EmptyStateProps = {
  children: ReactNode;
};

export function EmptyState({ children }: EmptyStateProps) {
  return <div style={components.emptyState.container}>{children}</div>;
}
