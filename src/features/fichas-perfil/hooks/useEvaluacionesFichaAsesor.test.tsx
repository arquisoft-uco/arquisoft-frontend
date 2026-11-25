import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useEvaluacionesFichaAsesor } from './useEvaluacionesFichaAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarEvaluacionesFichasAsesor: vi.fn() },
}));

const consultar = vi.mocked(fichasPerfilService.consultarEvaluacionesFichasAsesor);

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEvaluacionesFichaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filtra por la ficha, pide el tamaño máximo y entrega solo el contenido', async () => {
    // Arrange
    const content = [{ id: 'ev-1', estadoEvaluacionId: 'EN_EVALUACION' }];
    consultar.mockResolvedValue({
      content,
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 100,
    } as never);

    // Act
    const { result } = renderHook(() => useEvaluacionesFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 100,
      filtros: { tipo: 'PREDICADO', campo: 'fichaPerfil', operador: 'ES', valor: 'f-1' },
    });
    expect(result.current.data).toEqual(content);
  });

  it('no consulta sin id de ficha ni con habilitado falso', () => {
    // Act
    renderHook(() => useEvaluacionesFichaAsesor('', true), { wrapper: crearWrapper() });
    renderHook(() => useEvaluacionesFichaAsesor('f-1', false), { wrapper: crearWrapper() });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });
});
