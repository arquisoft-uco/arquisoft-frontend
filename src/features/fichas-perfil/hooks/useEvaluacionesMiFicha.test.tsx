import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useEvaluacionesMiFicha } from './useEvaluacionesMiFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarEvaluacionesMiFichaPerfil: vi.fn() },
}));
vi.mock('./useFichaPerfilIdEstudiante', () => ({ useFichaPerfilIdEstudiante: vi.fn() }));

const consultar = vi.mocked(fichasPerfilService.consultarEvaluacionesMiFichaPerfil);
const idEstudiante = vi.mocked(useFichaPerfilIdEstudiante);

function evaluacion(id: string, fechaCreacion: string) {
  return {
    id,
    fichaPerfilId: 'f-1',
    fechaCreacion,
    estadoEvaluacionId: 'APROBADA',
    estadoEvaluacionNombre: 'Aprobada',
    representante: { id: 'r-1', nombre: 'Rosa Gil' },
  };
}

const ANTIGUA = evaluacion('ev-1', '2026-09-01T10:00:00Z');
const RECIENTE = evaluacion('ev-2', '2026-09-05T10:00:00Z');

function conFicha(fichaPerfilId: string | null) {
  idEstudiante.mockReturnValue({ fichaPerfilId } as ReturnType<typeof useFichaPerfilIdEstudiante>);
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEvaluacionesMiFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve las evaluaciones de la más reciente a la más antigua sin alterar la caché', async () => {
    // Arrange
    conFicha('f-1');
    consultar.mockResolvedValue([ANTIGUA, RECIENTE]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEvaluacionesMiFicha(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(consultar).toHaveBeenCalledWith('f-1');
    expect(result.current.evaluaciones.map((e) => e.id)).toEqual(['ev-2', 'ev-1']);
    expect(result.current.fichaPerfilIdDisponible).toBe(true);
    expect(
      queryClient.getQueryData(['fichas-perfil', 'estudiante', 'f-1', 'evaluaciones']),
    ).toEqual([ANTIGUA, RECIENTE]);
  });

  it('no llama al service cuando no hay ficha activa', () => {
    // Arrange
    conFicha(null);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEvaluacionesMiFicha(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.fichaPerfilIdDisponible).toBe(false);
    expect(result.current.evaluaciones).toEqual([]);
  });

  it('expone el error cuando falla la consulta', async () => {
    // Arrange
    conFicha('f-1');
    consultar.mockRejectedValue(new Error('fallo'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEvaluacionesMiFicha(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.evaluaciones).toEqual([]);
  });
});
