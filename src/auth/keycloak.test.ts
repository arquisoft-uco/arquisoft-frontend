import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { contextoTemporal } from '../shared/utils/contexto-temporal';
import { logout } from './keycloak';

vi.mock('keycloak-js', () => ({
  default: vi.fn(function Keycloak() {
    return { idToken: 'id-token' };
  }),
}));

const OPCIONES = { esquema: z.object({ titulo: z.string() }), ambito: 'u-1|coordinador' };

describe('keycloak logout', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { origin: 'http://app.test', href: '' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('borra los snapshots de contexto y redirige al cierre de sesión del proveedor', () => {
    // Arrange
    contextoTemporal.guardar({ tipo: 'ficha', id: 'f-1' }, { titulo: 'Ficha' }, OPCIONES);
    sessionStorage.setItem('otra-clave', 'intacta');

    // Act
    logout();

    // Assert
    expect(sessionStorage.getItem('arquisoft:ctx:ficha:f-1')).toBeNull();
    expect(sessionStorage.getItem('otra-clave')).toBe('intacta');
    expect(window.location.href).toContain('/protocol/openid-connect/logout');
    expect(window.location.href).toContain('post_logout_redirect_uri=http%3A%2F%2Fapp.test');
  });
});
