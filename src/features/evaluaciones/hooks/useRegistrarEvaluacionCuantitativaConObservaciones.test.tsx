import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarEvaluacionCuantitativaConObservaciones } from './useRegistrarEvaluacionCuantitativaConObservaciones';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    registrarEvaluacionesCuantitativasJurado: vi.fn(),
    getEvaluacionesCuantitativasRealizadasJurado: vi.fn(),
    registrarObservacionItemJurado: vi.fn(),
  },
}));

const registrarPuntajes = vi.mocked(evaluacionesService.registrarEvaluacionesCuantitativasJurado);
const leer = vi.mocked(evaluacionesService.getEvaluacionesCuantitativasRealizadasJurado);
const registrarObservacion = vi.mocked(evaluacionesService.registrarObservacionItemJurado);

const valoracion = (id: string, itemId: string) => ({
  id,
  puntaje: 10,
  item: { id: itemId, nombre: itemId, descripcion: 'd', categoriaId: 'c', valor: 50 },
});

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const PARES = [
  { itemId: 'i-1', puntaje: 10, observacion: 'Uno' },
  { itemId: 'i-2', puntaje: 20 },
];

function montar() {
  return renderHook(() => useRegistrarEvaluacionCuantitativaConObservaciones('ej-1'), {
    wrapper: Wrapper,
  });
}

describe('useRegistrarEvaluacionCuantitativaConObservaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registrarPuntajes.mockResolvedValue(undefined);
    leer.mockResolvedValue([valoracion('ec-1', 'i-1'), valoracion('ec-2', 'i-2')]);
    registrarObservacion.mockResolvedValue({ id: 'obs' });
  });

  it('sin observaciones registra solo los puntajes y no llama a ninguna observación', async () => {
    // Arrange
    const { result } = montar();
    const onSuccess = vi.fn();

    // Act
    act(() => {
      result.current.registrar([{ itemId: 'i-2', puntaje: 20 }], { onSuccess, onError: vi.fn() });
    });

    // Assert
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledWith({ total: 1, totalObservaciones: 0, pendientes: [] });
    expect(registrarObservacion).not.toHaveBeenCalled();
    expect(leer).not.toHaveBeenCalled();
  });

  it('con observaciones registra primero los puntajes, luego las observaciones y entrega pendientes vacías', async () => {
    // Arrange
    const { result } = montar();
    const onSuccess = vi.fn();

    // Act
    act(() => {
      result.current.registrar(PARES, { onSuccess, onError: vi.fn() });
    });

    // Assert
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(registrarPuntajes).toHaveBeenCalledTimes(1);
    expect(registrarObservacion).toHaveBeenCalledTimes(1);
    expect(registrarObservacion).toHaveBeenCalledWith({
      evaluacionCuantitativaJuradoId: 'ec-1',
      descripcion: 'Uno',
    });
    expect(registrarPuntajes.mock.invocationCallOrder[0]).toBeLessThan(
      registrarObservacion.mock.invocationCallOrder[0],
    );
    expect(onSuccess).toHaveBeenCalledWith({ total: 2, totalObservaciones: 1, pendientes: [] });
  });

  it('si fallan los puntajes avisa el error y no intenta ninguna observación', async () => {
    // Arrange
    const falla = new Error('puntajes');
    registrarPuntajes.mockRejectedValue(falla);
    const { result } = montar();
    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Act
    act(() => {
      result.current.registrar(PARES, { onSuccess, onError });
    });

    // Assert
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0]).toBe(falla);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(registrarObservacion).not.toHaveBeenCalled();
    expect(result.current.pendientes).toEqual([]);
  });

  it('ante un fallo parcial conserva las pendientes y reintentar repite solo ellas sin reenviar los puntajes', async () => {
    // Arrange
    registrarObservacion.mockRejectedValueOnce(new Error('cae'));
    const { result } = montar();
    const onSuccess = vi.fn();

    // Act
    act(() => {
      result.current.registrar(PARES, { onSuccess, onError: vi.fn() });
    });

    // Assert
    await waitFor(() => expect(result.current.pendientes).toHaveLength(1));
    expect(result.current.pendientes[0]).toMatchObject({ itemId: 'i-1', descripcion: 'Uno' });
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ totalObservaciones: 1, pendientes: result.current.pendientes }),
    );

    // Act
    const alReintentar = vi.fn();
    await act(async () => {
      await result.current.reintentar({ onSuccess: alReintentar });
    });

    // Assert
    expect(registrarPuntajes).toHaveBeenCalledTimes(1);
    expect(registrarObservacion).toHaveBeenCalledTimes(2);
    expect(alReintentar).toHaveBeenCalledWith({ total: 0, totalObservaciones: 1, pendientes: [] });
    expect(result.current.pendientes).toEqual([]);
    expect(result.current.reintentando).toBe(false);
  });
});
