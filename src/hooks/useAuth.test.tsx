import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';
import { Rol } from '../shared/models/rol';
import { useAmbitoDeSesion, useNombreUsuario } from './useAuth';

function conToken(tokenParsed: Record<string, unknown>, username = 'maria.lopez@uni.edu') {
  setAuthenticatedUser({ tokenParsed: { sub: 'u-1', ...tokenParsed }, username });
}

describe('useNombreUsuario', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('usa given_name como nombre y given_name + family_name como nombre completo', () => {
    conToken({ given_name: 'Ana', family_name: 'Pérez' });

    const { result } = renderHook(() => useNombreUsuario());

    expect(result.current).toEqual({ nombre: 'Ana', nombreCompleto: 'Ana Pérez' });
  });

  it('con solo name toma la primera palabra como nombre y name como nombre completo', () => {
    conToken({ name: 'Luis Gómez Ruiz' });

    const { result } = renderHook(() => useNombreUsuario());

    expect(result.current).toEqual({ nombre: 'Luis', nombreCompleto: 'Luis Gómez Ruiz' });
  });

  it.each([
    ['maria.lopez@uni.edu', 'Maria'],
    ['dev_user', 'Dev'],
    ['carlos@uni.edu', 'Carlos'],
  ])('sin claims de nombre deriva de %s la inicial mayúscula %s', (username, esperado) => {
    conToken({}, username);

    const { result } = renderHook(() => useNombreUsuario());

    expect(result.current).toEqual({ nombre: esperado, nombreCompleto: esperado });
  });
});

describe('useAmbitoDeSesion', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('combina el sub del usuario con el rol activo y cambia al cambiar el rol o el usuario', () => {
    // Arrange
    const roles = [Rol.Coordinador, Rol.Asesor];
    setAuthenticatedUser({ tokenParsed: { sub: 'u-1', realm_access: { roles } } });
    setActiveRole(Rol.Coordinador);

    // Act
    const { result } = renderHook(() => useAmbitoDeSesion());
    const comoCoordinador = result.current;
    act(() => setActiveRole(Rol.Asesor));
    const comoAsesor = result.current;
    act(() => setAuthenticatedUser({ tokenParsed: { sub: 'u-2', realm_access: { roles } } }));

    // Assert
    expect(comoCoordinador).toBe('u-1|coordinador');
    expect(comoAsesor).toBe('u-1|asesor');
    expect(result.current).toBe('u-2|asesor');
  });

  it('sin sub usa el username de respaldo y sin rol activo deja el rol vacío', () => {
    // Arrange
    setAuthenticatedUser({
      tokenParsed: { realm_access: { roles: [Rol.Coordinador, Rol.Asesor] } },
      username: 'maria',
    });

    // Act
    const { result } = renderHook(() => useAmbitoDeSesion());

    // Assert
    expect(result.current).toBe('maria|');
  });
});
