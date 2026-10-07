import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
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
  { id: 'EN_CONSTRUCCION', nombre: 'En Construccion', descripcion: 'desc' },
  { id: 'DISPONIBLE_PARA_EVALUACION', nombre: 'Disponible Para Evaluacion', descripcion: 'desc' },
  { id: 'DESCARTADA', nombre: 'Descartada', descripcion: 'desc' },
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
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados…');
  });

  it('deriva el <select> con todos los estados que retorna el endpoint, sin filtrar en el cliente', () => {
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
      'En Construccion',
      'Disponible Para Evaluacion',
      'Descartada',
    ]);
  });

  it('renderiza completo un catálogo distinto (coordinador) sin depender de una lista local', () => {
    // Arrange
    const estadosCoordinador: EstadoFicha[] = [
      { id: 'APROBADA', nombre: 'Aprobada', descripcion: 'desc' },
      {
        id: 'APROBADA_CON_OBSERVACIONES',
        nombre: 'Aprobada Con Observaciones',
        descripcion: 'desc',
      },
      { id: 'NO_APROBADA', nombre: 'No Aprobada', descripcion: 'desc' },
    ];
    vi.mocked(useEstadosFicha).mockReturnValue(crearEstadosMock({ data: estadosCoordinador }));

    // Act
    render(<EstadosFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Seleccionar estado...',
      'Aprobada',
      'Aprobada Con Observaciones',
      'No Aprobada',
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

  it('avisa que cambiar el estado aún no está disponible y deja el envío deshabilitado aunque se elija un estado', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn();
    vi.mocked(useAgregarEstadoFichaPerfil).mockReturnValue(crearMutacionMock({ mutate }));
    vi.mocked(useEstadosFicha).mockReturnValue(crearEstadosMock({ data: ESTADOS }));
    render(<EstadosFichaPanel fichaPerfilId="f-1" />);

    // Act
    await user.selectOptions(screen.getByLabelText('Nuevo estado'), 'DESCARTADA');
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar estado' })).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });
});
