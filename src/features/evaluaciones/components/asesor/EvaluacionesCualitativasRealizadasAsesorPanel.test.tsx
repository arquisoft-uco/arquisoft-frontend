import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EvaluacionesCualitativasRealizadasAsesorPanel from './EvaluacionesCualitativasRealizadasAsesorPanel';
import type { ConsultaCualitativasAsesor } from './ConsultarEvaluacionesCualitativasAsesor';
import type { EvaluacionCualitativaAsesor } from '../../models/EvaluacionCualitativaAsesor';

vi.mock('../../hooks/useCriteriosItemCualitativoAsesor', () => ({
  useCriteriosItemCualitativoAsesor: () => ({
    isLoading: false,
    isError: false,
    data: [{ id: 'c-ec-1', nombre: 'Excelente', descripcion: 'Supera lo esperado' }],
    refetch: vi.fn(),
  }),
}));
vi.mock('../../hooks/useCambiarCriterioEvaluacionCualitativaAsesor', () => ({
  useCambiarCriterioEvaluacionCualitativaAsesor: () => ({
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  }),
}));
vi.mock('../../hooks/useOmitirEvaluacionesCualitativasAsesor', () => ({
  useOmitirEvaluacionesCualitativasAsesor: () => ({ isPending: false, mutate: vi.fn() }),
}));

function fila(id: string, item: string): EvaluacionCualitativaAsesor {
  return {
    id,
    item: { id: `i-${id}`, nombre: item, descripcion: `Descripción de ${item}`, peso: 100 },
    criterio: { id: `c-${id}`, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
  };
}

const CLARIDAD = fila('ec-1', 'Claridad');
const ORDEN = fila('ec-2', 'Orden');

function consulta(data: EvaluacionCualitativaAsesor[]): ConsultaCualitativasAsesor {
  return { data, error: null, isLoading: false, isError: false, refetch: vi.fn() };
}

function panel(data: EvaluacionCualitativaAsesor[], finalizada = false) {
  return (
    <EvaluacionesCualitativasRealizadasAsesorPanel
      evaluacionAsesorId="ea-1"
      consulta={consulta(data)}
      finalizada={finalizada}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={vi.fn()}
    />
  );
}

describe('EvaluacionesCualitativasRealizadasAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con la evaluación finalizada no hay casillas, barra ni acción para cambiar', () => {
    // Arrange / Act
    render(panel([CLARIDAD], true));

    // Assert
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Omitir/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cambiar criterio/ })).not.toBeInTheDocument();
    expect(screen.getAllByText('Excelente').length).toBeGreaterThan(0);
  });

  it('marcar una fila habilita «Omitir (1)» y la selección se descarta cuando el ítem ya no está en los datos', async () => {
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

  it('«Cambiar criterio» convierte la celda en editor, Esc lo cierra y el foco vuelve a la acción', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel([CLARIDAD]));
    const accion = screen.getAllByRole('button', { name: /Cambiar criterio del ítem Claridad/ })[0];

    // Act
    await user.click(accion);

    // Assert
    expect(screen.getAllByRole('combobox', { name: 'Criterio para Claridad' })[0]).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'Guardar criterio de Claridad' })[0],
    ).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('combobox', { name: 'Criterio para Claridad' })).toBeNull();
    expect(
      screen.getAllByRole('button', { name: /Cambiar criterio del ítem Claridad/ })[0],
    ).toBeInTheDocument();
  });

  it('sin filas no muestra la barra y sí el estado vacío', () => {
    // Arrange / Act
    render(panel([]));

    // Assert
    expect(screen.queryByRole('button', { name: /Omitir/ })).not.toBeInTheDocument();
    expect(screen.getByText('Aún no hay evaluaciones cualitativas')).toBeInTheDocument();
  });
});
