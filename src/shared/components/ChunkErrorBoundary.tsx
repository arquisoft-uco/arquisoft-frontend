import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary that catches React.lazy() chunk load failures.
 * Offers a reload button so users can recover from deploy-mismatch errors.
 * Must be a class component — React has no functional equivalent for error boundaries.
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ChunkErrorBoundary]', { message: error.message, componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] items-center justify-center p-12">
          <div className="text-center">
            <p className="text-sm text-on-surface-secondary">
              Error al cargar el módulo. Por favor recarga la página.
            </p>
            <button
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
