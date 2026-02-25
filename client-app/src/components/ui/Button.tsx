import type { ButtonHTMLAttributes } from "react";
import Button from "./button";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton(props: ButtonProps) {
  return <Button variant="primary" {...props} />;
}

export function OutlineButton(props: ButtonProps) {
  return <Button variant="outline" {...props} />;
}

export function GhostButton(props: ButtonProps) {
  return <Button variant="ghost" {...props} />;
}

export default Button;
