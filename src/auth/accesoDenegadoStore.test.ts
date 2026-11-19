import { beforeEach, describe, expect, it } from 'vitest';
import { resetAllStores, setAuthenticatedUser } from '../test-utils/store.utils';
import { useAccesoDenegadoStore } from './accesoDenegadoStore';
import { useAuthStore } from './authStore';

describe('accesoDenegadoStore', () => {
  beforeEach(() => {
    resetAllStores();
    window.history.pushState({}, '', '/artefactos');
  });

  it('no marca sin sesión, durante el arranque, con ruta distinta a la actual ni sin ruta de origen', () => {
    const { marcar } = useAccesoDenegadoStore.getState();

    marcar('/artefactos');
    expect(useAccesoDenegadoStore.getState().ruta).toBeNull();

    setAuthenticatedUser();
    useAuthStore.setState({ isInitializing: true });
    marcar('/artefactos');
    expect(useAccesoDenegadoStore.getState().ruta).toBeNull();

    useAuthStore.setState({ isInitializing: false });
    marcar('/otra-ruta');
    marcar(undefined);
    expect(useAccesoDenegadoStore.getState().ruta).toBeNull();
  });

  it('marca la ruta de origen vigente y limpiar la borra', () => {
    setAuthenticatedUser();

    useAccesoDenegadoStore.getState().marcar('/artefactos');
    expect(useAccesoDenegadoStore.getState().ruta).toBe('/artefactos');

    useAccesoDenegadoStore.getState().limpiar();
    expect(useAccesoDenegadoStore.getState().ruta).toBeNull();
  });
});
