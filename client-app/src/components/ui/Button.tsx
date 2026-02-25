import React from "react";
import clsx from "clsx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded font-medium transition-colors focus:outline-none";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    />
  );
}

export const PrimaryButton = (props: ButtonProps) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: ButtonProps) => (
  <Button variant="secondary" {...props} />
);

export default Button;
