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
          <div className="text-lg font-semibold text-borealBlue">
            We’re refreshing your session
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Please reload to continue your application.
          </p>
          <button
            className="mt-4 inline-flex items-center justify-center rounded-full bg-borealBlue px-5 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
