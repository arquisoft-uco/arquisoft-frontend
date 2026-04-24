import { useAuthStore } from '../auth/authStore';
import { useRoleStore } from '../auth/roleStore';
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
