import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logClientEvent } from "@/lib/monitoring";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logClientEvent({
      message: error?.message || "Unexpected app error",
      severity: "critical",
      source: "error_boundary",
      componentStack: info?.componentStack,
      metadata: { stack: error?.stack }
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground" role="alert" aria-live="assertive">
        <div className="mx-auto max-w-md rounded-3xl border bg-card p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-black">Something needs a quick refresh</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your information is safe. Please refresh and continue when ready.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh app
          </button>
        </div>
      </main>
    );
  }
}