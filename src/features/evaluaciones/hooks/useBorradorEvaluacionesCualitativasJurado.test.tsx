import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { ItemEvaluacion } from '../models/ItemEvaluacion';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import { useBorradorEvaluacionesCualitativasJurado } from './useBorradorEvaluacionesCualitativasJurado';
import { useRegistrarEvaluacionesCualitativasJurado } from './useRegistrarEvaluacionesCualitativasJurado';

vi.mock('./useRegistrarEvaluacionesCualitativasJurado', () => ({
  useRegistrarEvaluacionesCualitativasJurado: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const registro = vi.mocked(useRegistrarEvaluacionesCualitativasJurado);
const mutate = vi.fn();
const reset = vi.fn();

const ITEM_1 = '11111111-1111-4111-8111-111111111111';
const ITEM_2 = '22222222-2222-4222-8222-222222222222';
const ITEM_3 = '33333333-3333-4333-8333-333333333333';
const CRITERIO_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CRITERIO_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const item = (id: string, nombre: string): ItemCualitativoJurado => ({
  id,
  nombre,
  descripcion: '',
  peso: 10,
});

const FILAS: ItemEvaluacion<ItemCualitativoJurado>[] = [
  { item: item(ITEM_1, 'Claridad'), pendiente: true },
  { item: item(ITEM_2, 'Rigor'), pendiente: true },
  { item: item(ITEM_3, 'Aporte'), pendiente: false },
];
const CRITERIOS = [
  { id: CRITERIO_A, nombre: 'Cumple', descripcion: '' },
  { id: CRITERIO_B, nombre: 'No cumple', descripcion: '' },
];

function montar(filas = FILAS) {
  return renderHook(() =>
    useBorradorEvaluacionesCualitativasJurado({
      evaluacionJuradoId: 'ej-1',
      proyecto: 'Proyecto Alfa',
      filas,
      criterios: CRITERIOS,
    }),
  );
}

describe('useBorradorEvaluacionesCualitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registro.mockReturnValue({ mutate, isPending: false, reset } as Partial<
      ReturnType<typeof useRegistrarEvaluacionesCualitativasJurado>
    > as ReturnType<typeof useRegistrarEvaluacionesCualitativasJurado>);
  });

  it('envía en un solo lote solo las filas elegidas e ignora las que ya no están pendientes', () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => {
      result.current.elegir(ITEM_2, CRITERIO_B);
      result.current.elegir(ITEM_3, CRITERIO_A);
    });
    act(() => result.current.registrar());

    // Assert
    expect(result.current.cantidad).toBe(1);
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual([{ itemId: ITEM_2, criterioId: CRITERIO_B }]);
  });

  it('un valor vacío quita la elección y sin elecciones no envía nada y avisa', () => {
    // Arrange
    const { result } = montar();
    act(() => result.current.elegir(ITEM_1, CRITERIO_A));

    // Act
    act(() => result.current.elegir(ITEM_1, ''));
    act(() => result.current.registrar());

    // Assert
    expect(result.current.cantidad).toBe(0);
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
    act(() => result.current.elegir(ITEM_1, CRITERIO_A));

    // Act
    act(() => result.current.registrar());

    // Assert
    expect(toast.success).toHaveBeenCalledWith(
      'Evaluación registrada',
      'Se registraron 1 valoración de Proyecto Alfa.',
    );
    expect(result.current.borrador).toEqual({});
    expect(result.current.cantidad).toBe(0);
  });

  it('en error muestra un toast y deja el borrador intacto', () => {
    // Arrange
    mutate.mockImplementation((_pares, opciones) => opciones.onError(new Error('cae')));
    const { result } = montar();
    act(() => result.current.elegir(ITEM_1, CRITERIO_A));

    // Act
    act(() => result.current.registrar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la evaluación',
      expect.any(String),
    );
    expect(result.current.borrador).toEqual({ [ITEM_1]: CRITERIO_A });
    expect(result.current.cantidad).toBe(1);
  });

  it('descartar limpia la selección sin enviar', () => {
    // Arrange
    const { result } = montar();
    act(() => result.current.elegir(ITEM_1, CRITERIO_A));

    // Act
    act(() => result.current.descartar());

    // Assert
    expect(result.current.borrador).toEqual({});
    expect(mutate).not.toHaveBeenCalled();
  });
});
