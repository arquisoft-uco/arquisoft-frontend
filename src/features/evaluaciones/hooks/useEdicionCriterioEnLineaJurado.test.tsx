import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { EvaluacionCualitativaJurado } from '../models/EvaluacionCualitativaJurado';
import { useCambiarCriterioEvaluacionCualitativaJurado } from './useCambiarCriterioEvaluacionCualitativaJurado';
import { useEdicionCriterioEnLineaJurado } from './useEdicionCriterioEnLineaJurado';

vi.mock('./useCambiarCriterioEvaluacionCualitativaJurado', () => ({
  useCambiarCriterioEvaluacionCualitativaJurado: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambio = vi.mocked(useCambiarCriterioEvaluacionCualitativaJurado);
const mutate = vi.fn();
const reset = vi.fn();

const CRITERIO_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CRITERIO_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const FILA: EvaluacionCualitativaJurado = {
  id: 'ec-1',
  item: { id: 'i-1', nombre: 'Claridad', descripcion: '' },
  criterio: { id: CRITERIO_A, nombre: 'Cumple', descripcion: '' },
};

function errorApi(errorCode: string, fieldErrors?: { field: string; message: string }[]) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status: 422, fieldErrors },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function montar() {
  return renderHook(() => useEdicionCriterioEnLineaJurado('ej-1'));
}

describe('useEdicionCriterioEnLineaJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cambio.mockReturnValue({ mutate, isPending: false, reset } as Partial<
      ReturnType<typeof useCambiarCriterioEvaluacionCualitativaJurado>
    > as ReturnType<typeof useCambiarCriterioEvaluacionCualitativaJurado>);
  });

  it('iniciar abre la edición con el criterio actual y cancelar la cierra', () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => result.current.iniciar(FILA));

    // Assert
    expect(result.current.edicion).toMatchObject({ filaId: 'ec-1', valor: CRITERIO_A });

    // Act
    act(() => result.current.cancelar());

    // Assert
    expect(result.current.edicion).toBeNull();
  });

  it('guardar con otro criterio llama al cambio, avisa con un toast y termina la edición', () => {
    // Arrange
    mutate.mockImplementation((_req, { onSuccess }) => onSuccess());
    const { result } = montar();
    act(() => result.current.iniciar(FILA));
    act(() => result.current.cambiar(CRITERIO_B));

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(mutate.mock.calls[0][0]).toEqual({
      evaluacionCualitativaJuradoId: 'ec-1',
      criterioId: CRITERIO_B,
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Criterio cambiado',
      expect.stringContaining('Claridad'),
    );
    expect(result.current.edicion).toBeNull();
  });

  it('guardar sin cambiar el criterio cierra la edición sin llamar al backend', () => {
    // Arrange
    const { result } = montar();
    act(() => result.current.iniciar(FILA));

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.edicion).toBeNull();
  });

  it('un error de campo del backend deja el editor abierto con el mensaje bajo el control', () => {
    // Arrange
    mutate.mockImplementation((_req, { onError }) =>
      onError(
        errorApi('ERROR_DE_VALIDACION', [{ field: 'criterio', message: 'Criterio inválido' }]),
      ),
    );
    const { result } = montar();
    act(() => result.current.iniciar(FILA));
    act(() => result.current.cambiar(CRITERIO_B));

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar el criterio', expect.any(String));
    expect(result.current.edicion?.error).toBe('Criterio inválido');
  });

  it('un error que hoy cierra el panel cierra también la edición', () => {
    // Arrange
    mutate.mockImplementation((_req, { onError }) =>
      onError(errorApi('EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA')),
    );
    const { result } = montar();
    act(() => result.current.iniciar(FILA));
    act(() => result.current.cambiar(CRITERIO_B));

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(result.current.edicion).toBeNull();
  });
});
