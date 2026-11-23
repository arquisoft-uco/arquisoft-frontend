import { useAccesoDenegadoStore } from '../auth/accesoDenegadoStore';
import { useAuthStore } from '../auth/authStore';
import { useProveedorStore } from '../auth/proveedorStore';
import { useRoleStore } from '../auth/roleStore';
import { useToastStore } from '../shared/stores/toastStore';
import { contextoTemporal } from '../shared/utils/contexto-temporal';
import type { Rol } from '../shared/models/rol';

export function resetAllStores() {
  useAuthStore.setState({
    isInitializing: false,
    authenticated: false,
    token: undefined,
    tokenParsed: undefined,
    username: '',
  });
  useRoleStore.setState({ rolSeleccionado: null });
  useProveedorStore.setState({ proveedor: null, confirmadoEnEstaCarga: false });
  useToastStore.setState({ toasts: [] });
  useAccesoDenegadoStore.setState({ ruta: null });
  contextoTemporal.borrarTodo();
}

export function setAuthenticatedUser(overrides?: {
  token?: string;
  username?: string;
  tokenParsed?: Record<string, unknown>;
}) {
  useAuthStore.setState({
    isInitializing: false,
    authenticated: true,
    token: overrides?.token ?? 'test-token',
    tokenParsed: overrides?.tokenParsed ?? {
      sub: 'user-id',
      preferred_username: 'test-user',
      resource_access: { 'angular-app': { roles: ['ESTUDIANTE'] } },
    },
    username: overrides?.username ?? 'test-user',
  });
}

export function setActiveRole(rol: Rol) {
  useRoleStore.setState({ rolSeleccionado: rol });
}
