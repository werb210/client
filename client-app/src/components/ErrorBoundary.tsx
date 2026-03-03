// @ts-nocheck
import React from "react";
export default class ErrorBoundary extends React.Component<
  unknown,
  { hasError: boolean }
> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Unexpected error occurred.</div>;
    }

    return this.props.children;
  }
}
