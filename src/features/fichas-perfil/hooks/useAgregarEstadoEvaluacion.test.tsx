import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../models/fichas-perfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAgregarEstadoEvaluacion } from './useAgregarEstadoEvaluacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    agregarEstadoEvaluacion: vi.fn(),
  },
}));

const agregar = vi.mocked(fichasPerfilService.agregarEstadoEvaluacion);

const KEY = ['evaluacion-representante', 'f-1'];

const evaluaciones: EvaluacionFichaPerfil[] = [
  { id: 'ev-1', fichaPerfilId: 'f-1', fechaCreacion: '2026-10-01', estadoEvaluacionId: null, estadoEvaluacionNombre: null },
  { id: 'ev-2', fichaPerfilId: 'f-1', fechaCreacion: '2026-10-02', estadoEvaluacionId: null, estadoEvaluacionNombre: null },
];

function crear() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  queryClient.setQueryData(KEY, evaluaciones);
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, Wrapper };
}

describe('useAgregarEstadoEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('actualiza en la caché solo la evaluación con el id pedido', async () => {
    // Arrange
    agregar.mockResolvedValue({ id: 'x-1' });
    const { queryClient, Wrapper } = crear();
    const { result } = renderHook(() => useAgregarEstadoEvaluacion('f-1'), { wrapper: Wrapper });
    const req = { evaluacionFichaPerfilId: 'ev-2', estadoEvaluacionId: 'st-1' };

    // Act
    result.current.mutate({ req, estadoNombre: 'Aprobada' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(agregar).toHaveBeenCalledWith(req);
    expect(queryClient.getQueryData(KEY)).toEqual([
      evaluaciones[0],
      { ...evaluaciones[1], estadoEvaluacionId: 'st-1', estadoEvaluacionNombre: 'Aprobada' },
    ]);
  });

  it('deja la caché intacta cuando el service falla', async () => {
    // Arrange
    agregar.mockRejectedValue(new Error('fallo'));
    const { queryClient, Wrapper } = crear();
    const { result } = renderHook(() => useAgregarEstadoEvaluacion('f-1'), { wrapper: Wrapper });

    // Act
    result.current.mutate({
      req: { evaluacionFichaPerfilId: 'ev-2', estadoEvaluacionId: 'st-1' },
      estadoNombre: 'Aprobada',
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(queryClient.getQueryData(KEY)).toEqual(evaluaciones);
  });
});
