import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { EvaluacionAsignadaAsesor } from '../models/EvaluacionAsignadaAsesor';
import { evaluacionesService } from '../services/evaluacionesService';
import { useEvaluacionAsignadaAsesor } from './useEvaluacionAsignadaAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: { getEvaluacionesAsignadasAsesor: vi.fn() },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionesAsignadasAsesor);

function asignacion(id: string): EvaluacionAsignadaAsesor {
  return {
    id,
    evaluacion: { id: `ev-${id}`, estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
    entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 1 },
    tieneEvaluacionesCualitativas: false,
    tieneEvaluacionesCuantitativas: false,
    notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
  };
}

function pagina(
  numero: number,
  content: EvaluacionAsignadaAsesor[],
): Page<EvaluacionAsignadaAsesor> {
  return {
    content,
    page: numero,
    size: 50,
    totalElements: 2,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: content.length === 0,
  };
}

function montar(id: string | undefined) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return renderHook(() => useEvaluacionAsignadaAsesor(id), { wrapper: Wrapper });
}

describe('useEvaluacionAsignadaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina: n = 0 }) =>
      Promise.resolve(n === 0 ? pagina(0, [asignacion('ea-1')]) : pagina(1, [asignacion('ea-2')])),
    );
  });

  it('encuentra la asignación en una página posterior', async () => {
    // Act
    const { result } = montar('ea-2');

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('ea-2');
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('devuelve null si el id no está en ninguna página', async () => {
    // Act
    const { result } = montar('desconocido');

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('sin id no consulta el service', () => {
    // Act
    montar(undefined);

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });
});
