import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProveedorIdentidad } from './proveedor';

function doble(id: string): ProveedorIdentidad {
  return {
    id,
    restaurarSesion: vi.fn(),
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    credencialesHttp: vi.fn(),
    renovarSesion: vi.fn(),
  };
}

async function cargarRegistro(pdp: { url: string } | null) {
  vi.resetModules();
  vi.doMock('../../config/env', () => ({ PDP_CONFIG: pdp }));
  vi.doMock('./keycloak/keycloakProveedor', () => ({
    crearKeycloakProveedor: () => doble('keycloak'),
  }));
  vi.doMock('./pdp/pdpProveedor', () => ({ crearPdpProveedor: () => doble('pdp') }));
  return import('./proveedores');
}

describe('registro de proveedores', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('excluye al PDP de los disponibles sin su configuración y lo incluye con ella', async () => {
    // Act
    const sinPdp = await cargarRegistro(null);
    const idsSinPdp = sinPdp.proveedoresDisponibles().map((d) => d.id);
    const conPdp = await cargarRegistro({ url: 'http://pdp.test' });
    const idsConPdp = conPdp.proveedoresDisponibles().map((d) => d.id);

    // Assert
    expect(idsSinPdp).toEqual(['keycloak']);
    expect(idsConPdp).toEqual(['keycloak', 'pdp']);
    expect(conPdp.definicionDe('pdp')?.capacidades).toContain('administracion-seguridad');
    expect(conPdp.definicionDe('keycloak')?.capacidades).toEqual([]);
  });

  it('crearProveedor devuelve la instancia con el id pedido', async () => {
    // Arrange
    const registro = await cargarRegistro({ url: 'http://pdp.test' });

    // Act / Assert
    expect(registro.crearProveedor('keycloak').id).toBe('keycloak');
    expect(registro.crearProveedor('pdp').id).toBe('pdp');
  });

  it('un id desconocido falla de forma explícita', async () => {
    // Arrange
    const registro = await cargarRegistro(null);

    // Act / Assert
    expect(() => registro.crearProveedor('inexistente')).toThrow(/desconocido/);
  });

  it('todo proveedor del registro declara su proveedorApi no vacío en credencialesHttp', async () => {
    // Arrange
    vi.resetModules();
    vi.doUnmock('./keycloak/keycloakProveedor');
    vi.doUnmock('./pdp/pdpProveedor');
    vi.doMock('../../config/env', () => ({ PDP_CONFIG: { url: 'http://pdp.test' } }));
    vi.doMock('../keycloak', () => ({ keycloak: {}, scheduleRefresh: vi.fn(), logout: vi.fn() }));
    vi.doMock('../../api/axiosInstance', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
    vi.doMock('../../shared/utils/monitoring', () => ({ monitoring: { captureError: vi.fn() } }));
    const registro = await import('./proveedores');

    // Act
    const declarados = registro.proveedoresDisponibles().map((d) => ({
      id: d.id,
      proveedorApi: d.crear().credencialesHttp().proveedorApi,
    }));

    // Assert
    expect(declarados.map((d) => d.id)).toEqual(['keycloak', 'pdp']);
    declarados.forEach((d) => expect(d.proveedorApi).toEqual(expect.any(String)));
    declarados.forEach((d) => expect(d.proveedorApi).not.toBe(''));
  });
});
