import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { verificarSesionActiva } from '../../../auth/session';
import { SECURITY_UI_CONFIG } from '../../../config/env';
import { seguridadService } from '../services/seguridadService';
import { temaSecurityUi } from '../utils/tema-security-ui';

export function useSecurityUi() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const configuracion = SECURITY_UI_CONFIG;

  const consulta = useQuery({
    queryKey: ['seguridad', 'security-ui'],
    queryFn: async () => {
      if (!configuracion) throw new Error('[seguridad] Security UI no está configurada.');
      await verificarSesionActiva();
      return seguridadService.cargarModulo(configuracion.moduloUrl);
    },
    staleTime: Infinity,
    retry: false,
  });

  const modulo = consulta.data;

  // Sincroniza con un microfrontend externo a React: monta al tener el módulo y desmonta al salir.
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!modulo || !contenedor || !configuracion) return;

    const handle = modulo.mount(contenedor, {
      applicationName: configuracion.nombreAplicacion,
      apiBaseUrl: configuracion.apiBaseUrl,
      allowApplicationLifecycleManagement: false,
      theme: temaSecurityUi(getComputedStyle(document.body)),
    });
    return () => handle.unmount();
  }, [modulo, configuracion]);

  return {
    contenedorRef,
    cargando: consulta.isPending,
    error: consulta.isError,
    reintentar: () => void consulta.refetch(),
  };
}
