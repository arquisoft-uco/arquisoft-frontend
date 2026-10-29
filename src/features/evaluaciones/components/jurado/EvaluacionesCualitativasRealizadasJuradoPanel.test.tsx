import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EvaluacionesCualitativasRealizadasJuradoPanel from './EvaluacionesCualitativasRealizadasJuradoPanel';
import type { ConsultaCualitativas } from '../ConsultarEvaluacionesCualitativasJurado';
import type { EvaluacionCualitativaJurado } from '../../models/EvaluacionCualitativaJurado';

vi.mock('../../hooks/useOmitirEvaluacionesCualitativasJurado', () => ({
  useOmitirEvaluacionesCualitativasJurado: () => ({ isPending: false, mutate: vi.fn() }),
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

  it('con la evaluación finalizada muestra el aviso y no hay casillas ni barra', () => {
    // Arrange / Act
    render(panel([CLARIDAD], true));

    // Assert
    expect(
      screen.getByText(/ya fue finalizada; no se pueden omitir valoraciones/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
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
});
