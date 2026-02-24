import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("App crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg text-white text-center p-8">
          <div>
            <h1 className="text-3xl font-semibold mb-4">Something went wrong</h1>
            <p className="text-white/70">Please refresh the page.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
