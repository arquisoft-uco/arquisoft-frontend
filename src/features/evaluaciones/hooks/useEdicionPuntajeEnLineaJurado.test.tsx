import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import { useCambiarPuntajeEvaluacionCuantitativaJurado } from './useCambiarPuntajeEvaluacionCuantitativaJurado';
import { useEdicionPuntajeEnLineaJurado } from './useEdicionPuntajeEnLineaJurado';

vi.mock('./useCambiarPuntajeEvaluacionCuantitativaJurado', () => ({
  useCambiarPuntajeEvaluacionCuantitativaJurado: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambio = vi.mocked(useCambiarPuntajeEvaluacionCuantitativaJurado);
const mutate = vi.fn();
const reset = vi.fn();

const FILA: EvaluacionCuantitativaJurado = {
  id: 'ec-1',
  puntaje: 5,
  item: { id: 'i-1', nombre: 'Rigor', descripcion: '', categoriaId: 'c', valor: 10 },
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
  return renderHook(() => useEdicionPuntajeEnLineaJurado('ej-1'));
}

describe('useEdicionPuntajeEnLineaJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cambio.mockReturnValue({ mutate, isPending: false, reset } as Partial<
      ReturnType<typeof useCambiarPuntajeEvaluacionCuantitativaJurado>
    > as ReturnType<typeof useCambiarPuntajeEvaluacionCuantitativaJurado>);
  });

  it('iniciar abre la edición con el puntaje actual y cancelar la cierra', () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => result.current.iniciar(FILA));

    // Assert
    expect(result.current.edicion).toMatchObject({ filaId: 'ec-1', valor: '5' });

    // Act
    act(() => result.current.cancelar());

    // Assert
    expect(result.current.edicion).toBeNull();
  });

  it('guardar con un puntaje válido llama al cambio con un número, avisa y termina la edición', () => {
    // Arrange
    mutate.mockImplementation((_req, { onSuccess }) => onSuccess());
    const { result } = montar();
    act(() => result.current.iniciar(FILA));
    act(() => result.current.cambiar(' 8 '));

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(mutate.mock.calls[0][0]).toEqual({ evaluacionCuantitativaJuradoId: 'ec-1', puntaje: 8 });
    expect(toast.success).toHaveBeenCalledWith(
      'Puntaje cambiado',
      expect.stringContaining('Rigor'),
    );
    expect(result.current.edicion).toBeNull();
  });

  it('un puntaje fuera de rango no se envía y queda el error bajo el control', () => {
    // Arrange
    const { result } = montar();
    act(() => result.current.iniciar(FILA));
    act(() => result.current.cambiar('11'));

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.edicion?.error).toEqual(expect.any(String));

    // Act
    act(() => result.current.cambiar('9'));

    // Assert
    expect(result.current.edicion?.error).toBeUndefined();
  });

  it('un error de campo del backend deja el editor abierto y uno que cierra el panel cierra la edición', () => {
    // Arrange
    mutate.mockImplementationOnce((_req, { onError }) =>
      onError(errorApi('ERROR_DE_VALIDACION', [{ field: 'puntaje', message: 'Puntaje inválido' }])),
    );
    const { result } = montar();
    act(() => result.current.iniciar(FILA));
    act(() => result.current.cambiar('8'));

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar el puntaje', expect.any(String));
    expect(result.current.edicion?.error).toBe('Puntaje inválido');

    // Arrange
    mutate.mockImplementationOnce((_req, { onError }) =>
      onError(errorApi('EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA')),
    );

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(result.current.edicion).toBeNull();
  });
});
