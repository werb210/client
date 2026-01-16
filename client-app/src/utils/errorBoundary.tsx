import { Component, ReactNode } from "react";

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
        <div className="p-6 text-center">
          <div className="text-lg font-semibold text-slate-900">
            Something went wrong
          </div>
          <button
            className="mt-3 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
