import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarEstadoFichaPerfil } from './useAgregarEstadoFichaPerfil';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { agregarEstadoFichaPerfil: vi.fn() },
}));

const agregarEstado = vi.mocked(fichasPerfilService.agregarEstadoFichaPerfil);

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

describe('useAgregarEstadoFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id de la ficha y el estado, e invalida por prefijo sin tocar el catálogo', async () => {
    // Arrange
    agregarEstado.mockResolvedValue({ id: 'ef-1' });
    const contexto = crearContexto();
    const { Wrapper } = contexto;
    const { result } = renderHook(() => useAgregarEstadoFichaPerfil('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('DESCARTADA'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agregarEstado).toHaveBeenCalledWith('f-1', { estadoFichaId: 'DESCARTADA' });
    const filtro = crearEvaluador(contexto);
    expect(filtro.queryKey).toEqual(['fichas-perfil']);
    expect(filtro.acepta(['fichas-perfil', 'f-1', 'asesor-estados'])).toBe(true);
    expect(filtro.acepta(['fichas-perfil', 'asesor', 1])).toBe(true);
    expect(filtro.acepta(['fichas-perfil', 'estados-ficha'])).toBe(false);
  });

  it('expone el error y no invalida cuando el service rechaza', async () => {
    // Arrange
    agregarEstado.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useAgregarEstadoFichaPerfil('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('DESCARTADA'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
