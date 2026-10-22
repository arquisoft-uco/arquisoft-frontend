import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import CompanerosProyectoResumen from './CompanerosProyectoResumen';
import { useCompanerosProyectoGrado } from '../../hooks/useCompanerosProyectoGrado';
import type { CompaneroProyectoGrado } from '../../models/CompaneroProyectoGrado';

vi.mock('../../hooks/useCompanerosProyectoGrado', () => ({
  useCompanerosProyectoGrado: vi.fn(),
}));

type Hook = ReturnType<typeof useCompanerosProyectoGrado>;

const ANA: CompaneroProyectoGrado = {
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
};
const LUIS: CompaneroProyectoGrado = {
  estudianteId: 'e-2',
  identificador: '2002',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
};

function mockearHook(parcial: Partial<Record<keyof Hook, unknown>>) {
  vi.mocked(useCompanerosProyectoGrado).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as Hook);
}

describe('CompanerosProyectoResumen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cargando muestra el estado de carga', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<CompanerosProyectoResumen proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con error muestra el aviso en línea', () => {
    // Arrange
    mockearHook({ isError: true });

    // Act
    render(<CompanerosProyectoResumen proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar los estudiantes del proyecto.',
    );
  });

  it('lista cada estudiante con su nombre y correo en el orden recibido', () => {
    // Arrange
    mockearHook({ data: [ANA, LUIS] });

    // Act
    render(<CompanerosProyectoResumen proyectoGradoId="p-1" />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Estudiantes del proyecto' });
    const filas = within(lista).getAllByRole('listitem');
    expect(filas).toHaveLength(2);
    expect(filas[0]).toHaveTextContent('Ana Pérez');
    expect(filas[0]).toHaveTextContent('ana@uco.edu.co');
    expect(filas[1]).toHaveTextContent('Luis Gómez');
    expect(filas[1]).toHaveTextContent('luis@uco.edu.co');
    expect(useCompanerosProyectoGrado).toHaveBeenCalledWith('p-1');
  });
});
