import type { Medicion } from './arquitectura';

// Deuda que existía antes de que el test estructural (src/arquitectura.test.ts) fuera exigible.
// Solo puede decrecer: una entrada nueva, o un valor que crece, es una violación nueva y se corrige en
// el código, no aquí. Cuando un archivo ya cumple, el test pide eliminar su entrada.
export interface BaselineArquitectura {
  queryKeysFueraDeConvencion: Medicion;
  tiposInseguros: Medicion;
  componentesGrandes: Medicion;
  coloresCrudos: Medicion;
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
    'features/fichas-perfil/components/estudiante/AgregarItemForm.tsx': 151,
    'features/fichas-perfil/components/RegistrarFichaPerfil.tsx': 273,
    'features/fichas-perfil/components/representante/AgregarEstadoEvaluacionPanel.tsx': 193,
    'features/fichas-perfil/components/representante/ConsultarFichasRepresentante.tsx': 288,
    'features/solicitudes/components/estudiante/EnviarSolicitudNovedadForm.tsx': 177,
    'features/usuarios/components/administrador/ConsultarUsuarios.tsx': 152,
    'features/usuarios/components/administrador/FiltrosUsuariosPanel.tsx': 173,
    'features/usuarios/components/administrador/ModificarUsuarioForm.tsx': 302,
    'features/usuarios/components/administrador/RegistrarUsuarioForm.tsx': 228,
    'layout/Header.tsx': 182,
  },
  coloresCrudos: {
    'features/fichas-perfil/components/coordinador/EstudiantesVinculadosPanel.tsx': 3,
    'features/fichas-perfil/components/RegistrarFichaPerfil.tsx': 3,
    'features/fichas-perfil/components/representante/EstadosEvaluacionPanel.tsx': 10,
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
    'shared/hooks/useToast.ts': 2,
    'shared/models/api-response.ts': 3,
    'shared/models/rol.ts': 2,
    'shared/stores/toastStore.ts': 1,
    'shared/utils/api-error.ts': 7,
    'shared/utils/monitoring.ts': 1,
  },
};
