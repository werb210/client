import type { ReactNode, HTMLAttributes } from "react";
import { components, tokens } from "@/styles";

type FileUploadCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  status?: string;
  helperText?: string;
  children?: ReactNode;
};

export function FileUploadCard({
  title,
  status,
  helperText,
  children,
  ...rest
}: FileUploadCardProps) {
  return (
    <div style={components.uploadCard.container} {...rest}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: tokens.spacing.sm }}>
        <span style={components.uploadCard.title}>{title}</span>
        {status ? (
          <span style={{ fontSize: "12px", color: tokens.colors.textSecondary }}>
            {status}
          </span>
        ) : null}
      </div>
      {helperText ? <span style={components.uploadCard.meta}>{helperText}</span> : null}
      {children}
    </div>
  );
}
