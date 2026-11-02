import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import { useObservacionesRevisionEstudiante } from '../../hooks/useObservacionesRevisionEstudiante';
import { useCambiarEstadoObservacionEstudiante } from '../../hooks/useCambiarEstadoObservacionEstudiante';
import ObservacionesRevisionEstudiantePanel from './ObservacionesRevisionEstudiantePanel';

vi.mock('../../hooks/useCambiarEstadoObservacionEstudiante', () => ({
  useCambiarEstadoObservacionEstudiante: vi.fn(),
}));
vi.mock('../../hooks/useObservacionesRevisionEstudiante', () => ({
  useObservacionesRevisionEstudiante: vi.fn(),
}));

const hook = vi.mocked(useObservacionesRevisionEstudiante);

type Resultado = ReturnType<typeof useObservacionesRevisionEstudiante>;

function estado(parcial: Partial<Resultado>): Resultado {
  const base: Partial<Resultado> = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  return Object.assign(base, parcial) as Resultado;
}

const nueva: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-1',
  descripcion: 'Falta el diagrama de despliegue',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
};

const solucionada: ObservacionRevision = {
  ...nueva,
  id: 'o-2',
  descripcion: 'Corregir la portada',
  estadoId: 'SOLUCIONADA',
  estadoNombre: 'Solucionada',
};

describe('ObservacionesRevisionEstudiantePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga accesible mientras consulta', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    render(
      <ObservacionesRevisionEstudiantePanel
        revisionAsesorId="r-1"
        editable={false}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(hook).toHaveBeenCalledWith('r-1');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista una tarjeta por observación con su descripción y el nombre de su estado', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));

    // Act
    render(
      <ObservacionesRevisionEstudiantePanel
        revisionAsesorId="r-1"
        editable={false}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    const lista = screen.getByRole('list', { name: 'Observaciones de la revisión' });
    const items = within(lista).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Falta el diagrama de despliegue')).toBeInTheDocument();
    expect(within(items[0]).getByText('Nueva')).toBeInTheDocument();
    expect(within(items[1]).getByText('Corregir la portada')).toBeInTheDocument();
    expect(within(items[1]).getByText('Solucionada')).toBeInTheDocument();
  });

  it('muestra el vacío con el texto del estudiante y no un error', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    render(
      <ObservacionesRevisionEstudiantePanel
        revisionAsesorId="r-1"
        editable={false}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Esta revisión aún no tiene observaciones')).toBeInTheDocument();
    expect(
      screen.getByText('Tu asesor aún no ha registrado observaciones en esta revisión.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error y reintenta la consulta al pulsar Reintentar', async () => {
    // Arrange
    const refetch = vi.fn();
    hook.mockReturnValue(estado({ isError: true, error: new Error('Sin conexión'), refetch }));
    const user = userEvent.setup();

    // Act
    render(
      <ObservacionesRevisionEstudiantePanel
        revisionAsesorId="r-1"
        editable={false}
        onCerrar={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No pudimos cargar las observaciones')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('llama a onCerrar al pulsar Cerrar', async () => {
    // Arrange
    const onCerrar = vi.fn();
    hook.mockReturnValue(estado({ data: [] }));
    const user = userEvent.setup();

    // Act
    render(
      <ObservacionesRevisionEstudiantePanel
        revisionAsesorId="r-1"
        editable={false}
        onCerrar={onCerrar}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  });

  it('con editable muestra casilla solo en las observaciones avanzables; sin editable ninguna', () => {
    // Arrange
    const cerrada: ObservacionRevision = {
      ...nueva,
      id: 'o-3',
      descripcion: 'Ajustar el glosario',
      estadoId: 'CERRADA',
      estadoNombre: 'Cerrada',
    };
    const base: Partial<ReturnType<typeof useCambiarEstadoObservacionEstudiante>> = {
      mutate: vi.fn(),
      isPending: false,
    };
    vi.mocked(useCambiarEstadoObservacionEstudiante).mockReturnValue(
      Object.assign(base) as ReturnType<typeof useCambiarEstadoObservacionEstudiante>,
    );
    hook.mockReturnValue(estado({ data: [nueva, solucionada, cerrada] }));

    // Act
    const { unmount } = render(
      <ObservacionesRevisionEstudiantePanel revisionAsesorId="r-1" editable onCerrar={vi.fn()} />,
    );

    // Assert
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(
      screen.getByRole('checkbox', { name: 'Solucionada: Corregir la portada' }),
    ).toBeChecked();

    // Act
    unmount();
    render(
      <ObservacionesRevisionEstudiantePanel
        revisionAsesorId="r-1"
        editable={false}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
