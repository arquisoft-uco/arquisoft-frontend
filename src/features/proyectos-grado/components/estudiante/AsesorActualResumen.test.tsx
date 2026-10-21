import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import AsesorActualResumen from './AsesorActualResumen';
import { useAsesoresAsignadosProyectoGrado } from '../../hooks/useAsesoresAsignadosProyectoGrado';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';

vi.mock('../../hooks/useAsesoresAsignadosProyectoGrado', () => ({
  useAsesoresAsignadosProyectoGrado: vi.fn(),
}));

type Hook = ReturnType<typeof useAsesoresAsignadosProyectoGrado>;

const asesor: AsesorProyectoGrado = {
  id: 'ap-1',
  proyectoGradoId: 'p-1',
  asesorId: 'a-1',
  identificador: '1001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  estado: { id: 'ASIGNADO', nombre: 'Asignado' },
  fechaAsignado: '2026-03-10T12:00:00Z',
  vigente: true,
  actual: true,
};

function mockearHook(parcial: Partial<Record<keyof Hook, unknown>>) {
  vi.mocked(useAsesoresAsignadosProyectoGrado).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as Hook);
}

describe('AsesorActualResumen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cargando muestra el estado de carga', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<AsesorActualResumen proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con asesor actual muestra su nombre y correo', () => {
    // Arrange
    mockearHook({ data: [asesor] });

    // Act
    render(<AsesorActualResumen proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
  });

  it('sin asesor actual indica que no hay asesor asignado', () => {
    // Arrange
    mockearHook({ data: [{ ...asesor, actual: false }] });

    // Act
    render(<AsesorActualResumen proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('Sin asesor asignado')).toBeInTheDocument();
  });

  it('con error muestra el aviso en línea', () => {
    // Arrange
    mockearHook({ isError: true });

    // Act
    render(<AsesorActualResumen proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu asesor');
  });
});
