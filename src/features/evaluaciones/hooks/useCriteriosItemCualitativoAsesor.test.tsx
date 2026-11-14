import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { CriterioItemCualitativoAsesor } from '../models/CriterioItemCualitativoAsesor';
import { evaluacionesService } from '../services/evaluacionesService';
import { useCriteriosItemCualitativoAsesor } from './useCriteriosItemCualitativoAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getCriteriosItemCualitativoAsesor: vi.fn(),
  },
}));

const getCriterios = vi.mocked(evaluacionesService.getCriteriosItemCualitativoAsesor);

const CRITERIOS: CriterioItemCualitativoAsesor[] = [
  { id: 'c-1', nombre: 'Aplicabilidad', descripcion: 'Resuelve un problema real.' },
  { id: 'c-2', nombre: 'Claridad', descripcion: 'Se comprende sin ambigüedades.' },
];

function crearContexto() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useCriteriosItemCualitativoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve los criterios en el orden recibido y los guarda con la key del plan', async () => {
    // Arrange
    getCriterios.mockResolvedValue(CRITERIOS);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useCriteriosItemCualitativoAsesor(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(CRITERIOS);
    expect(queryClient.getQueryData(['evaluaciones', 'criterios-item-cualitativo-asesor'])).toEqual(
      CRITERIOS,
    );
  });

  it('si el service falla, expone isError', async () => {
    // Arrange
    getCriterios.mockRejectedValue(new Error('500'));
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useCriteriosItemCualitativoAsesor(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
