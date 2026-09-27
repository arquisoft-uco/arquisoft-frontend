import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import EstadosFichaPanel from './EstadosFichaPanel';
import { useEstadosFicha } from '../hooks/useEstadosFicha';
import { useAgregarEstadoFichaPerfil } from '../hooks/useAgregarEstadoFichaPerfil';
import type { EstadoFicha } from '../models/fichas-perfil';

vi.mock('../hooks/useEstadosFicha', () => ({
  useEstadosFicha: vi.fn(),
}));

vi.mock('../hooks/useAgregarEstadoFichaPerfil', () => ({
  useAgregarEstadoFichaPerfil: vi.fn(),
}));

function crearEstadosMock(
  parcial: Partial<ReturnType<typeof useEstadosFicha>> = {},
): ReturnType<typeof useEstadosFicha> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useEstadosFicha>;
}

function crearMutacionMock(
  parcial: Partial<ReturnType<typeof useAgregarEstadoFichaPerfil>> = {},
): ReturnType<typeof useAgregarEstadoFichaPerfil> {
  return {
    mutate: vi.fn(),
    isPending: false,
    ...parcial,
  } as ReturnType<typeof useAgregarEstadoFichaPerfil>;
}

const ESTADOS: EstadoFicha[] = [
  { id: '1', nombre: 'En Construcción', descripcion: 'desc' },
  { id: '2', nombre: 'Disponible Para Evaluación', descripcion: 'desc' },
  { id: '3', nombre: 'Aprobada', descripcion: 'desc' },
  { id: '4', nombre: 'Aprobada Con Observaciones', descripcion: 'desc' },
  { id: '5', nombre: 'No Aprobada', descripcion: 'desc' },
];

describe('EstadosFichaPanel', () => {
  beforeEach(() => {
    vi.mocked(useEstadosFicha).mockReset();
    vi.mocked(useAgregarEstadoFichaPerfil).mockReset();
    vi.mocked(useAgregarEstadoFichaPerfil).mockReturnValue(crearMutacionMock());
  });

  it('muestra el spinner accesible mientras carga el catálogo', () => {
    // Arrange
    vi.mocked(useEstadosFicha).mockReturnValue(crearEstadosMock({ isLoading: true }));

    // Act
    render(<EstadosFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados...');
  });

  it('deriva el <select> con solo los estados que el asesor puede asignar manualmente', () => {
    // Arrange
    vi.mocked(useEstadosFicha).mockReturnValue(crearEstadosMock({ data: ESTADOS }));

    // Act
    render(<EstadosFichaPanel fichaPerfilId="f-1" />);

    // Assert
    const select = screen.getByLabelText('Nuevo estado');
    const opciones = screen.getAllByRole('option').map((o) => o.textContent);
    expect(select).toBeInTheDocument();
    expect(opciones).toEqual([
      'Seleccionar estado...',
      'En Construcción',
      'Disponible Para Evaluación',
    ]);
  });

  it('pinta el badge de estado actual solo cuando la prop está definida', () => {
    // Arrange
    vi.mocked(useEstadosFicha).mockReturnValue(crearEstadosMock({ data: [] }));

    // Act — con estadoActual
    const { unmount } = render(<EstadosFichaPanel fichaPerfilId="f-1" estadoActual="Aprobada" />);

    // Assert
    expect(screen.getByText('Estado actual:')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    unmount();

    // Act — sin estadoActual
    render(<EstadosFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.queryByText('Estado actual:')).not.toBeInTheDocument();
  });

  it('con el catálogo vacío (o la consulta fallida), el <select> solo ofrece la opción por defecto', () => {
    // Arrange
    vi.mocked(useEstadosFicha).mockReturnValue(crearEstadosMock({ data: [] }));

    // Act
    render(<EstadosFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Seleccionar estado...' })).toBeInTheDocument();
  });
});
