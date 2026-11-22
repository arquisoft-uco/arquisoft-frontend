import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { ItemEvaluacionJurado } from '../models/ItemEvaluacionJurado';
import { useBorradorEvaluacionesCuantitativasJurado } from './useBorradorEvaluacionesCuantitativasJurado';
import {
  useRegistrarEvaluacionCuantitativaConObservaciones,
  type ResultadoRegistroConObservaciones,
} from './useRegistrarEvaluacionCuantitativaConObservaciones';

vi.mock('./useRegistrarEvaluacionCuantitativaConObservaciones', () => ({
  useRegistrarEvaluacionCuantitativaConObservaciones: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const compuesto = vi.mocked(useRegistrarEvaluacionCuantitativaConObservaciones);
const registrar = vi.fn();
const reintentar = vi.fn();
const descartarPendientes = vi.fn();
const reiniciarError = vi.fn();

const ITEM_1 = '11111111-1111-4111-8111-111111111111';
const ITEM_2 = '22222222-2222-4222-8222-222222222222';
const ITEM_3 = '33333333-3333-4333-8333-333333333333';

const item = (id: string, nombre: string): ItemCuantitativoJurado => ({
  id,
  nombre,
  descripcion: '',
  categoriaId: 'cat',
  valor: 10,
});

const FILAS: ItemEvaluacionJurado<ItemCuantitativoJurado>[] = [
  { item: item(ITEM_1, 'Claridad'), pendiente: true },
  { item: item(ITEM_2, 'Rigor'), pendiente: true },
  { item: item(ITEM_3, 'Aporte'), pendiente: false },
];

const RESULTADO_OK: ResultadoRegistroConObservaciones = {
  total: 1,
  totalObservaciones: 0,
  pendientes: [],
};

function simularCompuesto(pendientes: ResultadoRegistroConObservaciones['pendientes'] = []) {
  compuesto.mockReturnValue({
    registrar,
    reintentar,
    descartarPendientes,
    pendientes,
    enviando: false,
    reintentando: false,
    isError: false,
    error: null,
    reiniciarError,
  });
}

function montar() {
  return renderHook(() =>
    useBorradorEvaluacionesCuantitativasJurado({
      evaluacionJuradoId: 'ej-1',
      proyecto: 'Proyecto Alfa',
      filas: FILAS,
    }),
  );
}

describe('useBorradorEvaluacionesCuantitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularCompuesto();
  });

  it('arma el lote solo con las filas pendientes con valoración, con puntaje numérico y observación recortada', () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => {
      result.current.cambiar(ITEM_1, 'puntaje', ' 7 ');
      result.current.cambiar(ITEM_1, 'observacion', ' Buen trabajo ');
      result.current.cambiar(ITEM_2, 'puntaje', '3');
      result.current.cambiar(ITEM_3, 'puntaje', '5');
    });
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(result.current.cantidad).toBe(2);
    expect(registrar).toHaveBeenCalledTimes(1);
    expect(registrar.mock.calls[0][0]).toEqual([
      { itemId: ITEM_1, puntaje: 7, observacion: 'Buen trabajo' },
      { itemId: ITEM_2, puntaje: 3 },
    ]);
  });

  it('valida por fila antes de enviar: no envía y devuelve el primer ítem con error', () => {
    // Arrange
    const { result } = montar();
    act(() => {
      result.current.cambiar(ITEM_1, 'puntaje', '3');
      result.current.cambiar(ITEM_2, 'puntaje', '99');
      result.current.cambiar(ITEM_2, 'observacion', 'x');
    });
    let primera: string | null = null;

    // Act
    act(() => {
      primera = result.current.registrar();
    });

    // Assert
    expect(primera).toBe(ITEM_2);
    expect(registrar).not.toHaveBeenCalled();
    expect(result.current.errores[ITEM_2]?.puntaje).toEqual(expect.any(String));
    expect(result.current.errores[ITEM_1]).toBeUndefined();
  });

  it('una observación sin puntaje marca el puntaje como requerido y validarFila lo muestra al salir del campo', () => {
    // Arrange
    const { result } = montar();
    act(() => result.current.cambiar(ITEM_1, 'observacion', 'Solo texto'));

    // Act
    act(() => result.current.validarFila(ITEM_1));

    // Assert
    expect(result.current.errores[ITEM_1]?.puntaje).toEqual(expect.any(String));

    // Act
    act(() => result.current.cambiar(ITEM_1, 'puntaje', '4'));

    // Assert
    expect(result.current.errores[ITEM_1]?.puntaje).toBeUndefined();
  });

  it('en éxito sin pendientes avisa con un toast y limpia el borrador', () => {
    // Arrange
    registrar.mockImplementation((_pares, { onSuccess }) => onSuccess(RESULTADO_OK));
    const { result } = montar();
    act(() => result.current.cambiar(ITEM_1, 'puntaje', '4'));

    // Act
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(toast.success).toHaveBeenCalledWith('Evaluación registrada', expect.any(String));
    expect(result.current.borrador).toEqual({});
  });

  it('con observaciones fallidas avisa que faltan, limpia los puntajes y deja el aviso al compuesto', () => {
    // Arrange
    const fallidas = [{ itemId: ITEM_1, descripcion: 'Uno', motivo: 'cae' }];
    registrar.mockImplementation((_pares, { onSuccess }) =>
      onSuccess({ total: 1, totalObservaciones: 1, pendientes: fallidas }),
    );
    const { result } = montar();
    act(() => {
      result.current.cambiar(ITEM_1, 'puntaje', '4');
      result.current.cambiar(ITEM_1, 'observacion', 'Uno');
    });

    // Act
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Faltan observaciones', expect.any(String));
    expect(toast.success).not.toHaveBeenCalled();
    expect(result.current.borrador).toEqual({});
  });

  it('en error de envío muestra un toast y conserva el borrador', () => {
    // Arrange
    registrar.mockImplementation((_pares, { onError }) => onError(new Error('cae')));
    const { result } = montar();
    act(() => result.current.cambiar(ITEM_1, 'puntaje', '4'));

    // Act
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la evaluación',
      expect.any(String),
    );
    expect(result.current.borrador[ITEM_1]?.puntaje).toBe('4');
  });

  it('reintentar delega en el compuesto y avisa; descartarPendientes lo expone tal cual', async () => {
    // Arrange
    reintentar.mockImplementation(async ({ onSuccess }) =>
      onSuccess({ total: 0, totalObservaciones: 1, pendientes: [] }),
    );
    simularCompuesto([{ itemId: ITEM_1, descripcion: 'Uno', motivo: 'cae' }]);
    const { result } = montar();

    // Act
    await act(async () => {
      await result.current.reintentar();
    });
    act(() => result.current.descartarPendientes());

    // Assert
    expect(reintentar).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Evaluación registrada', expect.any(String));
    expect(descartarPendientes).toHaveBeenCalledTimes(1);
    expect(result.current.pendientes).toHaveLength(1);
  });
});
