import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarObservacionesEvaluacionCuantitativaJurado } from './useRegistrarObservacionesEvaluacionCuantitativaJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getEvaluacionesCuantitativasRealizadasJurado: vi.fn(),
    registrarObservacionItemJurado: vi.fn(),
  },
}));

const leer = vi.mocked(evaluacionesService.getEvaluacionesCuantitativasRealizadasJurado);
const registrar = vi.mocked(evaluacionesService.registrarObservacionItemJurado);

const valoracion = (id: string, itemId: string) => ({
  id,
  puntaje: 10,
  item: { id: itemId, nombre: itemId, descripcion: 'd', categoriaId: 'c', valor: 50 },
});

const OBSERVACIONES = [
  { itemId: 'i-1', descripcion: 'Uno' },
  { itemId: 'i-2', descripcion: 'Dos' },
];

function errorApi(errorCode: string, message = 'Mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

async function ejecutar() {
  const { result } = renderHook(
    () => useRegistrarObservacionesEvaluacionCuantitativaJurado('ej-1'),
    { wrapper: Wrapper },
  );
  let pendientes: Awaited<ReturnType<typeof result.current.mutateAsync>> = [];
  await act(async () => {
    pendientes = await result.current.mutateAsync(OBSERVACIONES);
  });
  return pendientes;
}

describe('useRegistrarObservacionesEvaluacionCuantitativaJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leer.mockResolvedValue([valoracion('ec-1', 'i-1'), valoracion('ec-2', 'i-2')]);
    registrar.mockResolvedValue({ id: 'obs' });
  });

  it('relee las valoraciones, registra cada observación con el id cruzado por ítem y no deja pendientes', async () => {
    // Act
    const pendientes = await ejecutar();

    // Assert
    expect(leer).toHaveBeenCalledWith('ej-1');
    expect(registrar).toHaveBeenCalledTimes(2);
    expect(registrar).toHaveBeenCalledWith({
      evaluacionCuantitativaJuradoId: 'ec-1',
      descripcion: 'Uno',
    });
    expect(registrar).toHaveBeenCalledWith({
      evaluacionCuantitativaJuradoId: 'ec-2',
      descripcion: 'Dos',
    });
    expect(pendientes).toEqual([]);
  });

  it('devuelve pendiente a la que falla con su motivo sin impedir las demás', async () => {
    // Arrange
    registrar.mockImplementation(({ evaluacionCuantitativaJuradoId }) =>
      evaluacionCuantitativaJuradoId === 'ec-1'
        ? Promise.reject(errorApi('OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA'))
        : Promise.resolve({ id: 'obs' }),
    );

    // Act
    const pendientes = await ejecutar();

    // Assert
    expect(registrar).toHaveBeenCalledTimes(2);
    expect(pendientes).toEqual([
      {
        itemId: 'i-1',
        descripcion: 'Uno',
        motivo: 'La evaluación está finalizada y no admite observaciones.',
      },
    ]);
  });

  it('trata una descripción duplicada como ya guardada', async () => {
    // Arrange
    registrar.mockRejectedValue(errorApi('OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA'));

    // Act
    const pendientes = await ejecutar();

    // Assert
    expect(pendientes).toEqual([]);
  });

  it('un ítem ausente en la relectura queda pendiente sin llamar al service', async () => {
    // Arrange
    leer.mockResolvedValue([valoracion('ec-1', 'i-1')]);

    // Act
    const pendientes = await ejecutar();

    // Assert
    expect(registrar).toHaveBeenCalledTimes(1);
    expect(pendientes).toEqual([
      {
        itemId: 'i-2',
        descripcion: 'Dos',
        motivo: 'No se encontró la valoración registrada de este ítem.',
      },
    ]);
  });

  it('si la relectura falla deja todas pendientes con el motivo del error y no registra nada', async () => {
    // Arrange
    leer.mockRejectedValue(errorApi('X', 'Sin conexión con valoraciones'));

    // Act
    const pendientes = await ejecutar();

    // Assert
    expect(registrar).not.toHaveBeenCalled();
    expect(pendientes).toHaveLength(2);
    expect(pendientes.every((p) => p.motivo === 'Sin conexión con valoraciones')).toBe(true);
  });
});
