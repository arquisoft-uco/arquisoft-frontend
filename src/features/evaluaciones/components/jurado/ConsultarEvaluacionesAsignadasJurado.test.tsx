import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarEvaluacionesAsignadasJurado from './ConsultarEvaluacionesAsignadasJurado';
import { useEvaluacionesAsignadasJurado } from '../../hooks/useEvaluacionesAsignadasJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';

vi.mock('../../hooks/useEvaluacionesAsignadasJurado', () => ({
  useEvaluacionesAsignadasJurado: vi.fn(),
}));

const ASIGNACION: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
};

const FINALIZADA: EvaluacionAsignadaJurado = {
  id: 'ej-2',
  evaluacion: { id: 'e-2', estado: { id: 'FINALIZADA', nombre: 'Finalizada' } },
  entregable: { id: 'en-2', proyecto: 'Plataforma de riego', version: 1 },
};

function mockHook(parcial: Partial<ReturnType<typeof useEvaluacionesAsignadasJurado>> = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEvaluacionesAsignadasJurado>;
  vi.mocked(useEvaluacionesAsignadasJurado).mockReturnValue(hook);
  return hook;
}

describe('ConsultarEvaluacionesAsignadasJurado', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionesAsignadasJurado).mockReset();
  });

  it('muestra un estado de carga accesible y marca la región como ocupada', () => {
    // Arrange
    mockHook({ isLoading: true, isFetching: true });

    // Act
    const { container } = render(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText(/asignadas?$/)).not.toBeInTheDocument();
  });

  it('con lista vacía muestra el vacío explicativo y no el error', () => {
    // Arrange
    mockHook({ data: [] });

    // Act
    render(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByText('Aún no tienes evaluaciones asignadas')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEvaluacionesAsignadasJurado />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar tus evaluaciones');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('lista proyecto, versión y estado en el orden recibido, con el resumen en singular y plural', () => {
    // Arrange
    mockHook({ data: [ASIGNACION] });
    const { rerender } = render(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByText('1 evaluación asignada')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Evaluaciones asignadas' });
    expect(tabla).toHaveTextContent('Sistema de monitoreo');
    expect(tabla).toHaveTextContent('Pendiente');

    // Act
    mockHook({ data: [ASIGNACION, FINALIZADA] });
    rerender(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByText('2 evaluaciones asignadas')).toBeInTheDocument();
    const filas = screen.getAllByRole('row');
    expect(filas[1]).toHaveTextContent('Sistema de monitoreo');
    expect(filas[2]).toHaveTextContent('Plataforma de riego');
    expect(filas[2]).toHaveTextContent('Finalizada');
  });
});
