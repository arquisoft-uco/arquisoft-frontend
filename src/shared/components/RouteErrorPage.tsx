import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';
import Button from './ui/Button';

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
          {detail && (
            <>
              <br />
              {detail}
            </>
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variante="secundario" onClick={() => navigate('/', { replace: true })}>
            Ir al inicio
          </Button>
          <Button onClick={() => window.location.reload()}>Recargar página</Button>
        </div>
      </div>
    </div>
  );
}
