import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarEstadoAprobacionFichaPerfil } from './useAgregarEstadoAprobacionFichaPerfil';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { agregarEstadoAprobacionFichaPerfil: vi.fn() },
}));

const agregarAprobacion = vi.mocked(fichasPerfilService.agregarEstadoAprobacionFichaPerfil);

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar, queryClient };
}

describe('useAgregarEstadoAprobacionFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id de la ficha y acepta, e invalida por prefijo sin tocar el catálogo', async () => {
    // Arrange
    agregarAprobacion.mockResolvedValue({ id: 'ef-1' });
    const { Wrapper, invalidar, queryClient } = crearContexto();
    const { result } = renderHook(() => useAgregarEstadoAprobacionFichaPerfil('f-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(true));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregarAprobacion).toHaveBeenCalledWith('f-1', { acepta: true });
    const filtro = invalidar.mock.calls[0][0];
    if (!filtro?.predicate) throw new Error('invalidateQueries sin predicate');
    const { predicate } = filtro;
    const acepta = (key: readonly unknown[]) =>
      predicate(queryClient.getQueryCache().build(queryClient, { queryKey: key }));
    expect(filtro.queryKey).toEqual(['fichas-perfil']);
    expect(acepta(['fichas-perfil', 'coordinador', 0])).toBe(true);
    expect(acepta(['fichas-perfil', 'estados-ficha'])).toBe(false);
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    agregarAprobacion.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarEstadoAprobacionFichaPerfil('f-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(false));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
