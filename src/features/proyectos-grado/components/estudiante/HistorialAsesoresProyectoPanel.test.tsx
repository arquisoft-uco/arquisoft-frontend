import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import HistorialAsesoresProyectoPanel from './HistorialAsesoresProyectoPanel';
import { useAsesoresAsignadosProyectoGrado } from '../../hooks/useAsesoresAsignadosProyectoGrado';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';

vi.mock('../../hooks/useAsesoresAsignadosProyectoGrado', () => ({
  useAsesoresAsignadosProyectoGrado: vi.fn(),
}));

type Hook = ReturnType<typeof useAsesoresAsignadosProyectoGrado>;

const asesor: AsesorProyectoGrado = {
  id: 'ap-2',
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
const finalizado: AsesorProyectoGrado = {
  ...asesor,
  id: 'ap-1',
  asesorId: 'a-2',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  estado: { id: 'FINALIZADO', nombre: 'Finalizado' },
  vigente: false,
  actual: false,
};

function mockearHook(parcial: Partial<Record<keyof Hook, unknown>>) {
  vi.mocked(useAsesoresAsignadosProyectoGrado).mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Hook);
}

describe('HistorialAsesoresProyectoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cargando muestra el esqueleto', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<HistorialAsesoresProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin asesores muestra el vacío', () => {
    // Arrange
    mockearHook({ data: [] });

    // Act
    render(<HistorialAsesoresProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('Este proyecto aún no tiene asesores')).toBeInTheDocument();
  });

  it('con error muestra el ErrorState y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockearHook({ isError: true, refetch });
    render(<HistorialAsesoresProyectoPanel proyectoGradoId="p-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('lista los asesores con «Dado de baja», sin aviso y en solo lectura', () => {
    // Arrange
    mockearHook({ data: [asesor, finalizado] });

    // Act
    render(<HistorialAsesoresProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Luis Gómez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dado de baja').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sin asesor asignado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('con solo registros finalizados muestra el aviso con el último asesor', () => {
    // Arrange
    mockearHook({ data: [finalizado] });

    // Act
    render(<HistorialAsesoresProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('Sin asesor asignado')).toBeInTheDocument();
    expect(screen.getByText(/Tu último asesor fue Luis Gómez \(finalizado\)/)).toBeInTheDocument();
    expect(screen.getAllByText('Último registro').length).toBeGreaterThan(0);
  });
});
