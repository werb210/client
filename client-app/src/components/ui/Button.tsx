import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "primary" | "secondary";
  size?: "default" | "sm" | "lg";
}

const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none";
const variantClasses: Record<string, string> = {
  default: "bg-brand-accent text-white hover:bg-brand-accentHover rounded-full h-11 px-6",
  outline: "border border-white/20 text-white hover:bg-white/10 rounded-full h-11 px-6",
  ghost: "text-white/80 hover:text-white",
};
const sizeClasses: Record<string, string> = {
  default: "",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-8 text-lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const resolvedVariant =
      variant === "primary" ? "default" : variant === "secondary" ? "outline" : variant;

    return (
      <button
        className={cn(baseClasses, variantClasses[resolvedVariant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

const PrimaryButton = (props: ButtonProps) => <Button {...props} variant="default" />;
const SecondaryButton = (props: ButtonProps) => <Button {...props} variant="outline" />;
const GhostButton = (props: ButtonProps) => <Button {...props} variant="ghost" />;

export { Button, PrimaryButton, SecondaryButton, GhostButton };
