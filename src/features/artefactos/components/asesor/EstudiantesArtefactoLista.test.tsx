import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';
import { useEstudiantesArtefacto } from '../../hooks/useEstudiantesArtefacto';
import EstudiantesArtefactoLista from './EstudiantesArtefactoLista';

vi.mock('../../hooks/useEstudiantesArtefacto', () => ({
  useEstudiantesArtefacto: vi.fn(),
}));

const hook = vi.mocked(useEstudiantesArtefacto);

type Resultado = ReturnType<typeof useEstudiantesArtefacto>;

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

const vigente: EstudianteArtefacto = {
  id: 'ea-1',
  artefactoId: 'a-1',
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  vigente: true,
};

const dadoDeBaja: EstudianteArtefacto = {
  ...vigente,
  id: 'ea-2',
  estudianteId: 'e-2',
  identificador: '2002',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  vigente: false,
};

describe('EstudiantesArtefactoLista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga accesible mientras consulta', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);

    // Assert
    expect(hook).toHaveBeenCalledWith('a-1');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista nombre, identificador y correo, y marca solo al estudiante no vigente', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [vigente, dadoDeBaja] }));

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Estudiantes del artefacto' });
    const items = within(lista).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(items[0]).getByText('2001')).toBeInTheDocument();
    expect(within(items[0]).getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(within(items[0]).queryByText('No vigente')).not.toBeInTheDocument();
    expect(within(items[1]).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(items[1]).getByText('No vigente')).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío y no un error cuando no hay vínculos', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);

    // Assert
    expect(screen.getByText('Este artefacto no tiene estudiantes vinculados')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error y reintenta la consulta al pulsar Reintentar', async () => {
    // Arrange
    const refetch = vi.fn();
    hook.mockReturnValue(estado({ isError: true, error: new Error('Sin conexión'), refetch }));
    const user = userEvent.setup();

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No pudimos cargar los estudiantes del artefacto')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
