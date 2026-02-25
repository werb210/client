import React from "react";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const className = `btn btn-${variant}`;

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export const PrimaryButton = (props: ButtonProps) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props: ButtonProps) => <Button variant="secondary" {...props} />;

export default Button;
