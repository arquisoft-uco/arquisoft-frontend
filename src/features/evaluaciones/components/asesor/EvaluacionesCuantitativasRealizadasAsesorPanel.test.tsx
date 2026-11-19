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

vi.mock('../../hooks/useRegistrarObservacionItemAsesor', () => ({
  useRegistrarObservacionItemAsesor: () => ({
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('../../hooks/useModificarObservacionItemAsesor', () => ({
  useModificarObservacionItemAsesor: () => ({
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('../../hooks/useRemoverObservacionItemAsesor', () => ({
  useRemoverObservacionItemAsesor: () => ({
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('../../hooks/useObservacionesEvaluacionCuantitativaAsesor', () => ({
  useObservacionesEvaluacionCuantitativaAsesor: () => ({
    data: {
      content: [{ id: 'o-1', descripcion: 'Falta rigor' }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
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

  it('con la evaluación finalizada sigue ofreciendo «Ver observaciones» y abre el panel del ítem', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(true));

    // Act
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Orden/ })[0]);

    // Assert
    expect(screen.getByText(/Orden · 50 de 100/)).toBeInTheDocument();
  });

  it('con la evaluación finalizada el aviso incluye las observaciones y no se ofrece «Registrar observación»', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(true));

    // Act
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Orden/ })[0]);

    // Assert
    expect(screen.getByText(/ni registrar, modificar o remover observaciones/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar observación' })).not.toBeInTheDocument();
  });

  it('sin finalizar, «Registrar observación» abre el formulario sobre el panel de observaciones', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(false));
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Orden/ })[0]);

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar observación' }));

    // Assert
    expect(screen.getByRole('form', { name: 'Registro de observación' })).toBeInTheDocument();
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

  it('sin finalizar, «Modificar observación» abre el formulario sobre el panel de observaciones', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(false));
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Orden/ })[0]);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Modificar observación' })[0]);

    // Assert
    expect(screen.getByRole('form', { name: 'Modificación de observación' })).toBeInTheDocument();
  });

  it('sin finalizar, «Remover observación» abre la confirmación sobre el panel de observaciones', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(false));
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Orden/ })[0]);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Remover observación' })[0]);

    // Assert
    expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Remover observación?');
  });

  it('con la evaluación finalizada no ofrece «Remover observación»', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(true));

    // Act
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Orden/ })[0]);

    // Assert
    expect(screen.getAllByText('Falta rigor').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /Remover observación/ })).not.toBeInTheDocument();
  });

  it('con la evaluación finalizada no ofrece «Modificar observación»', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel(true));

    // Act
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Orden/ })[0]);

    // Assert
    expect(screen.getAllByText('Falta rigor').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /Modificar observación/ })).not.toBeInTheDocument();
  });
});
