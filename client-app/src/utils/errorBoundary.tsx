import { Component, ReactNode } from "react";
import { Button } from "../components/ui/Button";
import { components, layout, tokens } from "@/styles";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("Application error boundary caught an error.", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ ...layout.page, textAlign: "center" }}>
          <div style={{ maxWidth: "420px", margin: "0 auto" }}>
            <div style={{ fontSize: tokens.typography.h2.fontSize, fontWeight: 600, color: tokens.colors.primary }}>
              We’re refreshing your session
            </div>
            <p style={{ ...components.form.subtitle, marginTop: tokens.spacing.xs }}>
              Please reload to continue your application.
            </p>
            <div style={{ marginTop: tokens.spacing.md, display: "flex", justifyContent: "center" }}>
              <Button onClick={() => window.location.reload()} type="button">
                Reload
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
