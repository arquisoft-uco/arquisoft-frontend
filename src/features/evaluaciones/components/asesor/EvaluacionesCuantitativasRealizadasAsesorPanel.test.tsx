import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EvaluacionesCuantitativasRealizadasAsesorPanel from './EvaluacionesCuantitativasRealizadasAsesorPanel';
import type { ConsultaCuantitativasAsesor } from './ConsultarEvaluacionesCuantitativasAsesor';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';

vi.mock('../../hooks/useCambiarPuntajeEvaluacionCuantitativaAsesor', () => ({
  useCambiarPuntajeEvaluacionCuantitativaAsesor: () => ({
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  }),
}));

function fila(id: string, nombre: string): EvaluacionCuantitativaAsesor {
  return {
    id,
    puntaje: 50,
    item: {
      id: `i-${id}`,
      nombre,
      descripcion: `Descripción de ${nombre}`,
      categoriaId: 'c',
      valor: 100,
    },
  };
}

const CLARIDAD = fila('ec-1', 'Claridad');
const ORDEN = fila('ec-2', 'Orden');

function consulta(data: EvaluacionCuantitativaAsesor[]): ConsultaCuantitativasAsesor {
  return { data, error: null, isLoading: false, isError: false, refetch: vi.fn() };
}

function panel(finalizada: boolean) {
  return (
    <EvaluacionesCuantitativasRealizadasAsesorPanel
      evaluacionAsesorId="ea-1"
      consulta={consulta([CLARIDAD, ORDEN])}
      finalizada={finalizada}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={vi.fn()}
    />
  );
}

describe('EvaluacionesCuantitativasRealizadasAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con la evaluación finalizada muestra el aviso y ninguna acción «Cambiar puntaje»', () => {
    // Arrange / Act
    render(panel(true));

    // Assert
    expect(
      screen.getByText(/ya fue finalizada; no se pueden cambiar valoraciones/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cambiar puntaje/ })).not.toBeInTheDocument();
  });

  it('sin finalizar, pulsar la acción de una fila abre el panel con ese ítem', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(false));

    // Act
    await user.click(screen.getAllByRole('button', { name: /Cambiar puntaje del ítem Orden/ })[0]);

    // Assert
    expect(screen.getByText('Ítem: Orden')).toBeInTheDocument();
  });
});
