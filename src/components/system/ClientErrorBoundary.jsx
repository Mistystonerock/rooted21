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
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-6 text-center">
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-rooted-cream bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-rooted-dark-green">Something needs attention</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your information is safe. We logged the issue so the Rooted 21 team can review it.</p>
            <button className="mt-4 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground" onClick={() => window.location.assign('/dashboard')}>Return to dashboard</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}