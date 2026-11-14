import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import EstadosDocumentacionPanel from './EstadosDocumentacionPanel';
import { useEstadosDocumentacion } from '../hooks/useEstadosDocumentacion';

vi.mock('../hooks/useEstadosDocumentacion', () => ({
  useEstadosDocumentacion: vi.fn(),
}));

function crearEstadosMock(
  parcial: Partial<ReturnType<typeof useEstadosDocumentacion>> = {},
): ReturnType<typeof useEstadosDocumentacion> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...parcial,
  } as ReturnType<typeof useEstadosDocumentacion>;
}

describe('EstadosDocumentacionPanel', () => {
  beforeEach(() => {
    vi.mocked(useEstadosDocumentacion).mockReset();
  });

  it('muestra el estado de carga accesible mientras carga el catálogo', () => {
    // Arrange
    vi.mocked(useEstadosDocumentacion).mockReturnValue(crearEstadosMock({ isLoading: true }));

    // Act
    render(<EstadosDocumentacionPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados de documentación…');
  });

  it('muestra nombre y descripción de cada estado en una lista accesible', () => {
    // Arrange
    vi.mocked(useEstadosDocumentacion).mockReturnValue(
      crearEstadosMock({
        data: [
          { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Pendiente de publicación' },
          { id: 'PUBLICADO', nombre: 'Publicado', descripcion: 'Ya está publicada' },
        ],
      }),
    );

    // Act
    render(<EstadosDocumentacionPanel />);

    // Assert
    expect(screen.getByRole('list', { name: 'Estados de una documentación' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Pendiente de publicación')).toBeInTheDocument();
    expect(screen.getByText('Publicado')).toBeInTheDocument();
    expect(screen.getByText('Ya está publicada')).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío cuando no hay estados', () => {
    // Arrange
    vi.mocked(useEstadosDocumentacion).mockReturnValue(crearEstadosMock({ data: [] }));

    // Act
    render(<EstadosDocumentacionPanel />);

    // Assert
    expect(screen.getByText('No hay estados de documentación registrados')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error y vuelve a consultar al pulsar «Reintentar»', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useEstadosDocumentacion).mockReturnValue(
      crearEstadosMock({ isError: true, error: new Error('boom'), refetch }),
    );
    render(<EstadosDocumentacionPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los estados de documentación',
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
