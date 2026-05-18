import React from 'react';
import { base44 } from '@/api/base44Client';

export default class ClientErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    base44.functions.invoke('reportClientError', {
      source: 'frontend',
      severity: 'high',
      message: error?.message || 'Unknown frontend error',
      safe_context: errorInfo?.componentStack || '',
      route_path: window.location.pathname,
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
          <div className="mx-auto max-w-md rounded-3xl border border-rooted-cream bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-rooted-dark-green">Something needs attention</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your information is safe. We saved what we could and logged the issue for review.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground" onClick={() => window.location.reload()}>Try again</button>
              <button className="rounded-xl border border-rooted-cream bg-white px-4 py-2 font-bold text-rooted-dark-green" onClick={() => window.location.assign('/dashboard')}>Return to dashboard</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}