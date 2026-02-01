import { components } from "@/styles";

type SpinnerProps = {
  variant?: "light" | "dark";
};

export function Spinner({ variant = "dark" }: SpinnerProps) {
  return (
    <span
      style={
        variant === "light"
          ? components.buttons.spinner
          : components.buttons.spinnerDark
      }
      aria-label="Loading"
    />
  );
}
