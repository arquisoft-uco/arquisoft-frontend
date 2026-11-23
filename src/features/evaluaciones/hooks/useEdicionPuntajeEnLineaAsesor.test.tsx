import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, renderHook } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { EvaluacionCuantitativaAsesor } from '../models/EvaluacionCuantitativaAsesor';
import { useCambiarPuntajeEvaluacionCuantitativaAsesor } from './useCambiarPuntajeEvaluacionCuantitativaAsesor';
import { useEdicionPuntajeEnLineaAsesor } from './useEdicionPuntajeEnLineaAsesor';

vi.mock('./useCambiarPuntajeEvaluacionCuantitativaAsesor', () => ({
  useCambiarPuntajeEvaluacionCuantitativaAsesor: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambio = vi.mocked(useCambiarPuntajeEvaluacionCuantitativaAsesor);
const mutate = vi.fn();
const reset = vi.fn();

const FILA: EvaluacionCuantitativaAsesor = {
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
  return renderHook(() => useEdicionPuntajeEnLineaAsesor('ea-1'));
}

describe('useEdicionPuntajeEnLineaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cambio.mockReturnValue({ mutate, isPending: false, reset } as Partial<
      ReturnType<typeof useCambiarPuntajeEvaluacionCuantitativaAsesor>
    > as ReturnType<typeof useCambiarPuntajeEvaluacionCuantitativaAsesor>);
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
    expect(mutate.mock.calls[0][0]).toEqual({ evaluacionCuantitativaAsesorId: 'ec-1', puntaje: 8 });
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
      onError(errorApi('EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA')),
    );

    // Act
    act(() => result.current.guardar());

    // Assert
    expect(result.current.edicion).toBeNull();
  });
});
