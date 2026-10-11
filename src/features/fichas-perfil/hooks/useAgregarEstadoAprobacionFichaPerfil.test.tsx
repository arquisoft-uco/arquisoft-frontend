import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarEstadoAprobacionFichaPerfil } from './useAgregarEstadoAprobacionFichaPerfil';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { agregarEstadoAprobacionFichaPerfil: vi.fn() },
}));

const decidir = vi.mocked(fichasPerfilService.agregarEstadoAprobacionFichaPerfil);

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

function crearEvaluador(contexto: ReturnType<typeof crearContexto>) {
  const filtro = contexto.invalidar.mock.calls[0][0];
  if (!filtro?.predicate) throw new Error('invalidateQueries sin predicate');
  const { predicate, queryKey } = filtro;
  return {
    queryKey,
    acepta: (key: readonly unknown[]) =>
      predicate(
        contexto.queryClient.getQueryCache().build(contexto.queryClient, { queryKey: key }),
      ),
  };
}

describe('useAgregarEstadoAprobacionFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id de la ficha y acepta, e invalida por prefijo sin tocar el catálogo', async () => {
    // Arrange
    decidir.mockResolvedValue({ id: 'ef-1' });
    const contexto = crearContexto();
    const { result } = renderHook(() => useAgregarEstadoAprobacionFichaPerfil('f-1'), {
      wrapper: contexto.Wrapper,
    });

    // Act
    act(() => result.current.mutate(false));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(decidir).toHaveBeenCalledWith('f-1', { acepta: false });
    const filtro = crearEvaluador(contexto);
    expect(filtro.queryKey).toEqual(['fichas-perfil']);
    expect(filtro.acepta(['fichas-perfil', 'f-1', 'estados-coordinador'])).toBe(true);
    expect(filtro.acepta(['fichas-perfil', 'f-1', 'evaluaciones-coordinador'])).toBe(true);
    expect(filtro.acepta(['fichas-perfil', 'estados-ficha'])).toBe(false);
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    decidir.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarEstadoAprobacionFichaPerfil('f-1'), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(true));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
