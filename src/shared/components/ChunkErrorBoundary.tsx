import { Component, type ErrorInfo, type ReactNode } from 'react';
import { monitoring } from '../utils/monitoring';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Clase: React no tiene equivalente funcional para un error boundary.
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    monitoring.captureError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] items-center justify-center p-12">
          <div className="text-center">
            <p className="text-sm text-on-surface-secondary">
              Error al cargar el módulo. Por favor recarga la página.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
