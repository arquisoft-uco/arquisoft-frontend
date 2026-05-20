import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';

/**
 * Error page for React Router's errorElement prop.
 * Handles errors thrown inside route components (AuthGuard, AppLayout, feature pages).
 * useRouteError() gives access to the thrown value — could be an Error, a Response, or anything.
 */
export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let message = 'Ocurrió un error inesperado.';
  let detail: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = `Error ${error.status}: ${error.statusText}`;
    detail = typeof error.data === 'string' ? error.data : undefined;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
        <p className="text-4xl font-bold text-on-surface">:(</p>
        <h1 className="mt-3 text-lg font-semibold text-on-surface">Algo salió mal</h1>
        <p className="mt-2 text-sm text-on-surface-secondary">
          Ocurrió un error en la aplicación. Puedes volver al inicio o recargar la página.
        </p>
        <p className="mt-4 rounded-lg bg-muted px-4 py-2 font-mono text-xs text-on-surface-secondary break-all">
          {message}
          {detail && <><br />{detail}</>}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted"
            onClick={() => navigate('/', { replace: true })}
          >
            Ir al inicio
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      </div>
    </div>
  );
}
