import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../auth/authStore';
import { initDevAuth } from '../auth/devAuth';
import { useProveedorStore } from '../auth/proveedorStore';
import { resolverProveedor, restaurarSesion } from '../auth/session';
import { AUTH_BYPASS } from '../config/env';
import { useProveedoresDisponibles } from '../hooks/useAuth';
import AppLoader from '../shared/components/AppLoader';
import Button from '../shared/components/ui/Button';
import ErrorState from '../shared/components/ui/ErrorState';

export default function AuthGuard() {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const proveedorElegido = useProveedorStore((s) => s.proveedor);
  const limpiarProveedor = useProveedorStore((s) => s.limpiarProveedor);
  const proveedores = useProveedoresDisponibles();
  const { pathname, search } = useLocation();
  const [fallo, setFallo] = useState(false);
  const [intento, setIntento] = useState(0);
  const intentoIniciado = useRef<number | null>(null);

  const requiereSelector = !AUTH_BYPASS && isInitializing && resolverProveedor() === null;

  useEffect(() => {
    // StrictMode monta dos veces: el intento evita una segunda restauración.
    if (intentoIniciado.current === intento) return;
    if (!AUTH_BYPASS && resolverProveedor() === null) return;
    intentoIniciado.current = intento;

    if (AUTH_BYPASS) {
      initDevAuth();
      return;
    }

    restaurarSesion().catch(() => {
      useAuthStore.getState().setInitializing(false);
      setFallo(true);
    });
  }, [intento, proveedorElegido]);

  function reintentar() {
    setFallo(false);
    useAuthStore.getState().reset();
    setIntento((n) => n + 1);
  }

  function elegirOtroMetodo() {
    setFallo(false);
    useAuthStore.getState().reset();
    limpiarProveedor();
  }

  if (requiereSelector) {
    return <Navigate to="/iniciar-sesion" replace state={{ desde: `${pathname}${search}` }} />;
  }

  if (fallo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-3">
          <ErrorState
            titulo="No pudimos iniciar tu sesión"
            descripcion="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={reintentar}
            className="w-full"
          />
          {proveedores.length > 1 && (
            <Button variante="fantasma" onClick={elegirOtroMetodo}>
              Elegir otro método
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isInitializing) return <AppLoader />;
  return <Outlet />;
}
