import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { ItemCuantitativoAsesor } from '../models/ItemCuantitativoAsesor';
import type { ItemEvaluacion } from '../models/ItemEvaluacion';
import { useBorradorEvaluacionesCuantitativasAsesor } from './useBorradorEvaluacionesCuantitativasAsesor';
import { useRegistrarEvaluacionesCuantitativasAsesor } from './useRegistrarEvaluacionesCuantitativasAsesor';

vi.mock('./useRegistrarEvaluacionesCuantitativasAsesor', () => ({
  useRegistrarEvaluacionesCuantitativasAsesor: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const registro = vi.mocked(useRegistrarEvaluacionesCuantitativasAsesor);
const mutate = vi.fn();
const reset = vi.fn();

const ITEM_1 = '11111111-1111-4111-8111-111111111111';
const ITEM_2 = '22222222-2222-4222-8222-222222222222';
const ITEM_3 = '33333333-3333-4333-8333-333333333333';

const item = (id: string, nombre: string): ItemCuantitativoAsesor => ({
  id,
  nombre,
  descripcion: '',
  categoriaId: 'cat',
  valor: 10,
});

const FILAS: ItemEvaluacion<ItemCuantitativoAsesor>[] = [
  { item: item(ITEM_1, 'Claridad'), pendiente: true },
  { item: item(ITEM_2, 'Rigor'), pendiente: true },
  { item: item(ITEM_3, 'Aporte'), pendiente: false },
];

function montar() {
  return renderHook(() =>
    useBorradorEvaluacionesCuantitativasAsesor({
      evaluacionAsesorId: 'ea-1',
      proyecto: 'Proyecto Alfa',
      filas: FILAS,
    }),
  );
}

describe('useBorradorEvaluacionesCuantitativasAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registro.mockReturnValue({ mutate, isPending: false, reset } as Partial<
      ReturnType<typeof useRegistrarEvaluacionesCuantitativasAsesor>
    > as ReturnType<typeof useRegistrarEvaluacionesCuantitativasAsesor>);
  });

  it('arma el lote solo con las filas pendientes con puntaje, como número y sin observación', () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => {
      result.current.cambiar(ITEM_1, ' 7 ');
      result.current.cambiar(ITEM_2, '3');
      result.current.cambiar(ITEM_3, '5');
    });
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(result.current.cantidad).toBe(2);
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual([
      { itemId: ITEM_1, puntaje: 7 },
      { itemId: ITEM_2, puntaje: 3 },
    ]);
  });

  it('valida por fila: no envía, devuelve el primer ítem con error y validarFila lo muestra al salir del campo', () => {
    // Arrange
    const { result } = montar();
    act(() => {
      result.current.cambiar(ITEM_1, '3');
      result.current.cambiar(ITEM_2, '99');
    });
    let primera: string | null = null;

    // Act
    act(() => {
      primera = result.current.registrar();
    });

    // Assert
    expect(primera).toBe(ITEM_2);
    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.errores[ITEM_2]).toEqual(expect.any(String));
    expect(result.current.errores[ITEM_1]).toBeUndefined();

    // Act
    act(() => result.current.cambiar(ITEM_2, '4'));
    act(() => result.current.cambiar(ITEM_1, 'abc'));
    act(() => result.current.validarFila(ITEM_1));

    // Assert
    expect(result.current.errores[ITEM_2]).toBeUndefined();
    expect(result.current.errores[ITEM_1]).toEqual(expect.any(String));
  });

  it('sin puntajes elegidos no envía nada', () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la evaluación',
      expect.any(String),
    );
  });

  it('en éxito avisa con un toast y limpia el borrador', () => {
    // Arrange
    mutate.mockImplementation((_pares, opciones) => opciones.onSuccess());
    const { result } = montar();
    act(() => result.current.cambiar(ITEM_1, '4'));

    // Act
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(toast.success).toHaveBeenCalledWith(
      'Evaluación registrada',
      'Se registraron 1 valoración de Proyecto Alfa.',
    );
    expect(result.current.borrador).toEqual({});
    expect(result.current.cantidad).toBe(0);
  });

  it('en error muestra un toast y conserva el borrador', () => {
    // Arrange
    mutate.mockImplementation((_pares, opciones) => opciones.onError(new Error('cae')));
    const { result } = montar();
    act(() => result.current.cambiar(ITEM_1, '4'));

    // Act
    act(() => {
      result.current.registrar();
    });

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la evaluación',
      expect.any(String),
    );
    expect(result.current.borrador[ITEM_1]).toBe('4');
  });

  it('descartar limpia el borrador y los errores sin enviar', () => {
    // Arrange
    const { result } = montar();
    act(() => result.current.cambiar(ITEM_1, '99'));
    act(() => {
      result.current.registrar();
    });

    // Act
    act(() => result.current.descartar());

    // Assert
    expect(result.current.borrador).toEqual({});
    expect(result.current.errores).toEqual({});
    expect(mutate).not.toHaveBeenCalled();
  });
});
