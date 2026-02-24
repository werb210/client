import Button, { type ButtonProps } from "./button";

const PrimaryButton = (props: ButtonProps) => <Button {...props} variant="primary" />;
const SecondaryButton = (props: ButtonProps) => <Button {...props} variant="outline" />;
const GhostButton = (props: ButtonProps) => <Button {...props} variant="outline" />;

export { Button, PrimaryButton, SecondaryButton, GhostButton };
export type { ButtonProps };
export default Button;
