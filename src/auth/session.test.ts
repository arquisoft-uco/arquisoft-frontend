import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cerrarSesion, resolverProveedor, restaurarSesion, verificarSesionActiva } from './session';
import { useAuthStore } from './authStore';
import { useProveedorStore } from './proveedorStore';
import { useRoleStore } from './roleStore';
import type { ProveedorIdentidad, SesionRestaurada } from './proveedores/proveedor';
import { fijarProveedorActivo, proveedorActivo } from './proveedores/proveedorActivo';
import { crearProveedor, proveedoresDisponibles } from './proveedores/proveedores';
import { Rol } from '../shared/models/rol';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';

vi.mock('./proveedores/proveedores', () => ({
  proveedoresDisponibles: vi.fn(),
  crearProveedor: vi.fn(),
}));

const REDIRECT = 'http://app.test';
const SESION: SesionRestaurada = {
  token: 'tk',
  tokenParsed: { sub: 'u-1', realm_access: { roles: ['estudiante'] } },
  username: 'ana',
};

function doble(id: string, sesion: SesionRestaurada | null = SESION) {
  return {
    id,
    restaurarSesion: vi.fn().mockResolvedValue(sesion),
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn().mockResolvedValue(undefined),
    credencialesHttp: vi.fn(),
    renovarSesion: vi.fn(),
  } satisfies ProveedorIdentidad;
}

function disponibles(...ids: string[]) {
  vi.mocked(proveedoresDisponibles).mockReturnValue(
    ids.map((id) => ({
      id,
      titulo: id,
      descripcion: '',
      capacidades: [],
      disponible: true,
      crear: vi.fn(),
    })),
  );
}

describe('session', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetAllStores();
    fijarProveedorActivo(null);
  });

  describe('resolverProveedor', () => {
    it('usa el recordado si sigue disponible, lo ignora si no, y con varios sin elegir devuelve null', () => {
      // Arrange
      disponibles('keycloak', 'pdp');

      // Act / Assert
      expect(resolverProveedor()).toBeNull();
      useProveedorStore.setState({ proveedor: 'pdp' });
      expect(resolverProveedor()).toBe('pdp');
      useProveedorStore.setState({ proveedor: 'fantasma' });
      expect(resolverProveedor()).toBeNull();
    });
  });

  describe('restaurarSesion', () => {
    it('con un solo proveedor lo elige, lo fija como activo y escribe el store una sola vez', async () => {
      // Arrange
      const keycloak = doble('keycloak');
      disponibles('keycloak');
      vi.mocked(crearProveedor).mockReturnValue(keycloak);
      const cambios = vi.fn();
      useAuthStore.subscribe(cambios);

      // Act
      await restaurarSesion();

      // Assert
      expect(useProveedorStore.getState().proveedor).toBe('keycloak');
      expect(proveedorActivo()).toBe(keycloak);
      expect(cambios).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState()).toMatchObject({
        authenticated: true,
        isInitializing: false,
        token: 'tk',
        username: 'ana',
      });
    });

    it('ignora un id recordado no disponible y usa el único proveedor disponible', async () => {
      // Arrange
      disponibles('keycloak');
      useProveedorStore.setState({ proveedor: 'fantasma' });
      vi.mocked(crearProveedor).mockReturnValue(doble('keycloak'));

      // Act
      await restaurarSesion();

      // Assert
      expect(crearProveedor).toHaveBeenCalledWith('keycloak');
    });

    it('con varios proveedores y ninguno elegido rechaza sin crear ninguno', async () => {
      // Arrange
      disponibles('keycloak', 'pdp');

      // Act / Assert
      await expect(restaurarSesion()).rejects.toThrow();
      expect(crearProveedor).not.toHaveBeenCalled();
    });

    it('si el proveedor deja el login en curso no escribe el store, y alActualizar solo renueva token y claims', async () => {
      // Arrange
      const keycloak = doble('keycloak', null);
      disponibles('keycloak');
      vi.mocked(crearProveedor).mockReturnValue(keycloak);

      // Act
      await restaurarSesion();
      const alActualizar = keycloak.restaurarSesion.mock.calls[0][0];
      const sinEscribir = useAuthStore.getState().authenticated;
      alActualizar({ ...SESION, token: 'tk-nuevo' });

      // Assert
      expect(sinEscribir).toBe(false);
      expect(useAuthStore.getState().token).toBe('tk-nuevo');
    });
  });

  describe('verificarSesionActiva', () => {
    it('sin proveedor activo rechaza', async () => {
      await expect(verificarSesionActiva()).rejects.toThrow();
    });

    it('consulta al proveedor activo sea cual sea, y rechaza si ya no hay sesión', async () => {
      // Arrange
      const otro = doble('otro');
      fijarProveedorActivo(otro);

      // Act
      await verificarSesionActiva();
      otro.restaurarSesion.mockResolvedValue(null);

      // Assert
      expect(otro.restaurarSesion).toHaveBeenCalledTimes(1);
      await expect(verificarSesionActiva()).rejects.toThrow();
    });
  });

  describe('cerrarSesion', () => {
    beforeEach(() => {
      setAuthenticatedUser();
      setActiveRole(Rol.Administrador);
      useProveedorStore.setState({ proveedor: 'keycloak' });
    });

    it('delega en el proveedor activo y limpia sesión, rol y proveedor recordado', async () => {
      // Arrange
      const keycloak = doble('keycloak');
      fijarProveedorActivo(keycloak);

      // Act
      await cerrarSesion(REDIRECT);

      // Assert
      expect(keycloak.cerrarSesion).toHaveBeenCalledWith(REDIRECT);
      expect(useAuthStore.getState().authenticated).toBe(false);
      expect(useAuthStore.getState().token).toBeUndefined();
      expect(useRoleStore.getState().rolSeleccionado).toBeNull();
      expect(useProveedorStore.getState().proveedor).toBeNull();
      expect(proveedorActivo()).toBeNull();
    });

    it('limpia el estado local aunque el cierre del proveedor falle', async () => {
      // Arrange
      const keycloak = doble('keycloak');
      keycloak.cerrarSesion.mockRejectedValue(new Error('sin red'));
      fijarProveedorActivo(keycloak);

      // Act / Assert
      await expect(cerrarSesion(REDIRECT)).rejects.toThrow('sin red');
      expect(useAuthStore.getState().authenticated).toBe(false);
      expect(useProveedorStore.getState().proveedor).toBeNull();
    });

    it('sin proveedor (bypass) solo limpia el estado local', async () => {
      // Act
      await cerrarSesion(REDIRECT);

      // Assert
      expect(useAuthStore.getState().authenticated).toBe(false);
      expect(useRoleStore.getState().rolSeleccionado).toBeNull();
    });
  });
});
