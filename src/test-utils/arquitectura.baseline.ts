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
    'features/fichas-perfil/components/asesor-ficha/EstadosFichasAsesorPanel.test.tsx': 2,
    'features/fichas-perfil/components/estudiante/EditarItemForm.test.tsx': 1,
    'features/fichas-perfil/components/estudiante/EditarTituloForm.test.tsx': 1,
  },
  componentesGrandes: {
    'features/dashboard/Dashboard.tsx': 273,
    'features/fichas-perfil/components/asesor-ficha/EstadosFichasAsesorPanel.tsx': 193,
    'features/fichas-perfil/components/coordinador/FichasPerfilTable.tsx': 153,
    'features/fichas-perfil/components/RegistrarFichaPerfil.tsx': 273,
    'features/fichas-perfil/components/representante/AgregarEstadoEvaluacionPanel.tsx': 193,
    'features/fichas-perfil/components/representante/ConsultarFichasRepresentante.tsx': 288,
    'features/solicitudes/components/estudiante/EnviarSolicitudNovedadForm.tsx': 158,
    'layout/Header.tsx': 182,
  },
  coloresCrudos: {
    'features/fichas-perfil/components/coordinador/EstudiantesVinculadosPanel.tsx': 3,
    'features/fichas-perfil/components/RegistrarFichaPerfil.tsx': 3,
  },
  coloresSinToken: {},
  spinnersCopiados: {
    'features/fichas-perfil/components/asesor-ficha/ConsultarFichasAsesor.tsx': 1,
    'features/fichas-perfil/components/asesor-ficha/EstadosFichasAsesorPanel.tsx': 1,
    'features/fichas-perfil/components/asesor-ficha/ItemsFichaAsesorPanel.tsx': 1,
    'features/fichas-perfil/components/coordinador/ConsultarFichasPerfilCoordinador.tsx': 1,
    'features/fichas-perfil/components/coordinador/EstudiantesVinculadosPanel.tsx': 1,
    'features/fichas-perfil/components/representante/AgregarEstadoEvaluacionPanel.tsx': 1,
    'features/fichas-perfil/components/representante/ConsultarFichasRepresentante.tsx': 1,
    'features/fichas-perfil/components/representante/ItemsFichaRepresentantePanel.tsx': 1,
    'features/fichas-perfil/components/representante/RegistrarEvaluacionPanel.tsx': 1,
    'shared/components/AppLoader.tsx': 1,
  },
  tablasFueraDeDataTable: {
    'features/fichas-perfil/components/asesor-ficha/ConsultarFichasAsesor.tsx': 1,
    'features/fichas-perfil/components/asesor-ficha/EstadosFichasAsesorPanel.tsx': 1,
    'features/fichas-perfil/components/coordinador/FichasPerfilTable.tsx': 1,
    'features/fichas-perfil/components/representante/ConsultarFichasRepresentante.tsx': 1,
    'features/fichas-perfil/components/TiposItemPanel.tsx': 1,
  },
  textosMenoresA12px: {
    'features/dashboard/Dashboard.tsx': 8,
    'features/fichas-perfil/components/asesor-ficha/ItemsFichaAsesorPanel.tsx': 1,
    'features/fichas-perfil/components/representante/ItemsFichaRepresentantePanel.tsx': 1,
    'layout/Header.tsx': 1,
    'layout/Sidebar.tsx': 3,
  },
  bloquesJsdoc: {
    'auth/authStore.ts': 3,
    'auth/devAuth.ts': 1,
    'auth/keycloak.ts': 4,
    'auth/roleStore.ts': 3,
    'config/env.ts': 1,
    'features/dashboard/Dashboard.tsx': 2,
    'features/fichas-perfil/components/RegistrarFichaPerfil.tsx': 1,
    'guards/AuthGuard.tsx': 1,
    'guards/RoleGuard.tsx': 2,
    'hooks/useAuth.ts': 3,
    'hooks/useHasRole.ts': 1,
    'layout/nav-items.ts': 3,
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
