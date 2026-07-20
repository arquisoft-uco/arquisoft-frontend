import { Component, type ErrorInfo, type ReactNode } from 'react';
import { monitoring } from '../utils/monitoring';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary wrapping the entire application tree.
 * Catches errors that escape AuthGuard, AppLayout, or any other root component,
 * preventing the user from seeing a blank screen with no recovery path.
 *
 * Must be a class component — React has no functional equivalent for error boundaries.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    monitoring.captureError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
            <p className="text-4xl font-bold text-on-surface">:(</p>
            <h1 className="mt-3 text-lg font-semibold text-on-surface">
              Algo salió mal
            </h1>
            <p className="mt-2 text-sm text-on-surface-secondary">
              Ocurrió un error inesperado en la aplicación. Puedes intentar recargar la página.
            </p>
            <p className="mt-4 rounded-lg bg-muted px-4 py-2 font-mono text-xs text-on-surface-secondary break-all">
              {this.state.error.message}
            </p>
            <button
              type="button"
              className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
