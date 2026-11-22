import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import EvaluacionesCualitativasRealizadasJuradoPanel from './EvaluacionesCualitativasRealizadasJuradoPanel';
import type { ConsultaCualitativas } from '../ConsultarEvaluacionesCualitativasJurado';
import type { EvaluacionCualitativaJurado } from '../../models/EvaluacionCualitativaJurado';

vi.mock('../../hooks/useOmitirEvaluacionesCualitativasJurado', () => ({
  useOmitirEvaluacionesCualitativasJurado: () => ({ isPending: false, mutate: vi.fn() }),
}));

const { cambiarCriterio } = vi.hoisted(() => ({ cambiarCriterio: vi.fn() }));

vi.mock('../../hooks/useCambiarCriterioEvaluacionCualitativaJurado', () => ({
  useCambiarCriterioEvaluacionCualitativaJurado: () => ({
    isPending: false,
    mutate: cambiarCriterio,
    reset: vi.fn(),
  }),
}));
vi.mock('../../hooks/useCriteriosItemCualitativoJurado', () => ({
  useCriteriosItemCualitativoJurado: () => ({
    data: [
      { id: 'c-ec-1', nombre: 'Excelente', descripcion: 'Supera lo esperado' },
      {
        id: '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
        nombre: 'Aceptable',
        descripcion: 'Cumple lo esperado',
      },
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function fila(id: string, item: string): EvaluacionCualitativaJurado {
  return {
    id,
    item: { id: `i-${id}`, nombre: item, descripcion: `Descripción de ${item}` },
    criterio: { id: `c-${id}`, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
  };
}

const CLARIDAD = fila('ec-1', 'Claridad');
const ORDEN = fila('ec-2', 'Orden');

function consulta(data: EvaluacionCualitativaJurado[]): ConsultaCualitativas {
  return { data, error: null, isLoading: false, isError: false, refetch: vi.fn() };
}

function panel(data: EvaluacionCualitativaJurado[], finalizada = false) {
  return (
    <EvaluacionesCualitativasRealizadasJuradoPanel
      evaluacionJuradoId="ej-1"
      consulta={consulta(data)}
      finalizada={finalizada}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={vi.fn()}
    />
  );
}

describe('EvaluacionesCualitativasRealizadasJuradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con la evaluación finalizada no hay casillas, barra ni acción de cambiar', () => {
    // Arrange / Act
    render(panel([CLARIDAD], true));

    // Assert
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cambiar criterio/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Omitir/ })).not.toBeInTheDocument();
  });

  it('marcar una fila habilita «Omitir (1)» y la selección se descarta cuando el id ya no está en los datos', async () => {
    // Arrange
    const user = userEvent.setup();
    const { rerender } = render(panel([CLARIDAD, ORDEN]));

    // Act
    await user.click(screen.getAllByRole('checkbox', { name: 'Seleccionar Claridad' })[0]);

    // Assert
    expect(screen.getByRole('button', { name: 'Omitir (1)' })).toBeEnabled();

    // Act
    rerender(panel([ORDEN]));

    // Assert
    expect(screen.getByRole('button', { name: 'Omitir (0)' })).toBeDisabled();
  });

  it('sin filas no muestra la barra y sí el estado vacío', () => {
    // Arrange / Act
    render(panel([]));

    // Assert
    expect(screen.queryByRole('button', { name: /Omitir/ })).not.toBeInTheDocument();
    expect(screen.getByText('Aún no hay evaluaciones cualitativas')).toBeInTheDocument();
  });

  it('«Cambiar criterio» abre el editor en la propia fila y «Guardar» envía el criterio elegido', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel([CLARIDAD, ORDEN]));
    const tabla = within(screen.getByRole('table'));

    // Act
    await user.click(tabla.getByRole('button', { name: /Cambiar criterio del ítem Orden/ }));
    const selector = tabla.getByRole('combobox', { name: 'Criterio para Orden' });
    await user.selectOptions(selector, 'Aceptable');
    await user.click(tabla.getByRole('button', { name: 'Guardar criterio de Orden' }));

    // Assert
    expect(cambiarCriterio).toHaveBeenCalledWith(
      { evaluacionCualitativaJuradoId: 'ec-2', criterioId: '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f' },
      expect.any(Object),
    );
  });

  it('Esc cancela la edición y devuelve el foco a la acción de esa fila', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel([CLARIDAD, ORDEN]));
    const tabla = within(screen.getByRole('table'));
    await user.click(tabla.getByRole('button', { name: /Cambiar criterio del ítem Orden/ }));

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(tabla.queryByRole('combobox', { name: 'Criterio para Orden' })).not.toBeInTheDocument();
    expect(tabla.getByRole('button', { name: /Cambiar criterio del ítem Orden/ })).toHaveFocus();
    expect(cambiarCriterio).not.toHaveBeenCalled();
  });
});
