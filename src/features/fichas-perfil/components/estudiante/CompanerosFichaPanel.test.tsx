import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import { useCompanerosFichaPerfil } from '../../hooks/useCompanerosFichaPerfil';
import CompanerosFichaPanel from './CompanerosFichaPanel';

vi.mock('../../hooks/useCompanerosFichaPerfil', () => ({
  useCompanerosFichaPerfil: vi.fn(),
}));

function conConsulta(parcial: Record<string, unknown>) {
  vi.mocked(useCompanerosFichaPerfil).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...parcial,
  } as ReturnType<typeof useCompanerosFichaPerfil>);
}

describe('CompanerosFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta los compañeros de la ficha recibida', () => {
    // Arrange
    conConsulta({ data: [] });

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    expect(useCompanerosFichaPerfil).toHaveBeenCalledWith('f-1');
  });

  it('muestra el estado de carga', () => {
    // Arrange
    conConsulta({ isLoading: true });

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando compañeros');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el texto de vacío sin alerta cuando no hay compañeros', () => {
    // Arrange
    conConsulta({ data: [] });

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    expect(screen.getByText('No tienes compañeros vinculados a esta ficha.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Compañeros' })).not.toBeInTheDocument();
  });

  it('muestra una alerta con el mensaje de respaldo cuando falla la consulta', () => {
    // Arrange
    conConsulta({ isError: true, error: new Error('fallo') });

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los compañeros.');
    expect(
      screen.queryByText('No tienes compañeros vinculados a esta ficha.'),
    ).not.toBeInTheDocument();
  });

  it('lista el nombre y el correo de cada compañero', () => {
    // Arrange
    conConsulta({
      data: [
        { idVinculo: 'v-2', id: 'e-2', nombre: 'Marta Gómez', email: 'marta@uco.edu.co' },
        { idVinculo: 'v-3', id: 'e-3', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' },
      ],
    });

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    const items = within(screen.getByRole('list', { name: 'Compañeros' })).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Marta Gómez')).toBeInTheDocument();
    expect(within(items[0]).getByText('marta@uco.edu.co')).toBeInTheDocument();
    expect(within(items[1]).getByText('Luis Pérez')).toBeInTheDocument();
    expect(within(items[1]).getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
