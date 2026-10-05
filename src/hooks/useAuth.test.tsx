import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../test-utils/store.utils';
import { useNombreUsuario } from './useAuth';

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
