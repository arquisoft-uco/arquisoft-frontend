import type { Medicion } from './arquitectura';

// Deuda que existía antes de que el test estructural (src/arquitectura.test.ts) fuera exigible.
// Solo puede decrecer: una entrada nueva, o un valor que crece, es una violación nueva y se corrige en
// el código, no aquí. Cuando un archivo ya cumple, el test pide eliminar su entrada.
export interface BaselineArquitectura {
  queryKeysFueraDeConvencion: Medicion;
  tiposInseguros: Medicion;
  componentesGrandes: Medicion;
  coloresCrudos: Medicion;
  coloresSinToken: Medicion;
  spinnersCopiados: Medicion;
  tablasFueraDeDataTable: Medicion;
  textosMenoresA12px: Medicion;
  bloquesJsdoc: Medicion;
}

export const BASELINE: BaselineArquitectura = {
  queryKeysFueraDeConvencion: {},
  tiposInseguros: {
    'api/axiosInstance.test.ts': 1,
    'auth/devAuth.ts': 1,
  },
  componentesGrandes: {
    'features/solicitudes/components/estudiante/EnviarSolicitudNovedadForm.tsx': 158,
  },
  coloresCrudos: {},
  coloresSinToken: {},
  spinnersCopiados: {
    'shared/components/AppLoader.tsx': 1,
  },
  tablasFueraDeDataTable: {},
  textosMenoresA12px: {},
  bloquesJsdoc: {
    'auth/authStore.ts': 3,
    'auth/devAuth.ts': 1,
    'auth/keycloak.ts': 4,
    'auth/roleStore.ts': 3,
    'config/env.ts': 1,
    'guards/AuthGuard.tsx': 1,
    'guards/RoleGuard.tsx': 2,
    'hooks/useHasRole.ts': 1,
    'router.tsx': 2,
    'shared/components/ChunkErrorBoundary.tsx': 1,
    'shared/components/RootErrorBoundary.tsx': 1,
    'shared/components/RouteErrorPage.tsx': 1,
    'shared/models/api-response.ts': 3,
    'shared/models/rol.ts': 2,
    'shared/utils/api-error.ts': 7,
    'shared/utils/monitoring.ts': 1,
  },
};
