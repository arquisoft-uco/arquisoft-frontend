import { beforeEach, describe, expect, it } from 'vitest';
import { useNavigate } from 'react-router';
import { act } from '@testing-library/react';
import { renderHook } from '../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';
import { useAccesoDenegadoStore } from '../auth/accesoDenegadoStore';
import { Rol } from '../shared/models/rol';
import { useAccesoDenegado } from './useAccesoDenegado';

function useConNavegacion() {
  return { ...useAccesoDenegado(), navigate: useNavigate() };
}

function marcar(ruta: string | null) {
  act(() => useAccesoDenegadoStore.setState({ ruta }));
}

describe('useAccesoDenegado', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({
      tokenParsed: { sub: 'u', realm_access: { roles: [Rol.Asesor, Rol.Estudiante] } },
    });
    setActiveRole(Rol.Asesor);
  });

  it('denegado solo si la ruta marcada es la actual', () => {
    const { result } = renderHook(useConNavegacion, { initialPath: '/artefactos' });

    marcar('/otra');
    expect(result.current.denegado).toBe(false);

    marcar('/artefactos');
    expect(result.current.denegado).toBe(true);
  });

  it('se limpia al navegar, al cambiar de rol y con reintentar', () => {
    const { result } = renderHook(useConNavegacion, { initialPath: '/artefactos' });

    marcar('/artefactos');
    act(() => result.current.navigate('/artefactos'));
    expect(result.current.denegado).toBe(false);

    marcar('/artefactos');
    act(() => setActiveRole(Rol.Estudiante));
    expect(result.current.denegado).toBe(false);

    marcar('/artefactos');
    act(() => result.current.reintentar());
    expect(result.current.denegado).toBe(false);
    expect(useAccesoDenegadoStore.getState().ruta).toBeNull();
  });
});
