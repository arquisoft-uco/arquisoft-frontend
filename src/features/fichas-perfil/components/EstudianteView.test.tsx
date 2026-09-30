import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import userEvent from '@testing-library/user-event';
import EstudianteView from './EstudianteView';
import { useMiFichaPerfil } from '../hooks/useMiFichaPerfil';

vi.mock('../hooks/useMiFichaPerfil', () => ({
  useMiFichaPerfil: vi.fn(),
}));
vi.mock('./estudiante/MiFichaHeader', () => ({
  default: () => <div>Encabezado de la ficha</div>,
}));
vi.mock('./estudiante/ItemsMiFichaPanel', () => ({ default: () => <div>Panel de ítems</div> }));
vi.mock('./estudiante/EstadosMiFichaPanel', () => ({ default: () => <div /> }));
vi.mock('./estudiante/RevisionesMiFichaPanel', () => ({ default: () => <div /> }));
vi.mock('./estudiante/EvaluacionesMiFichaPanel', () => ({ default: () => <div /> }));
vi.mock('./TiposItemPanel', () => ({ default: () => <div /> }));

function crearMock(
  parcial: Partial<ReturnType<typeof useMiFichaPerfil>> = {},
): ReturnType<typeof useMiFichaPerfil> {
  return {
    ficha: undefined,
    fichas: [],
    seleccionarFicha: vi.fn(),
    isLoadingFicha: false,
    isErrorFicha: false,
    sinFicha: false,
    errorFicha: false,
    companeros: [],
    ...parcial,
  } as ReturnType<typeof useMiFichaPerfil>;
}

const FICHA = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
  estadoActual: { id: 'st-1', nombre: 'En revisión', fechaActualizacion: '2026-09-01T10:00:00' },
  integrantes: [],
};

describe('EstudianteView', () => {
  beforeEach(() => {
    vi.mocked(useMiFichaPerfil).mockReset();
  });

  it('muestra el spinner accesible mientras carga la ficha', () => {
    // Arrange
    vi.mocked(useMiFichaPerfil).mockReturnValue(crearMock({ isLoadingFicha: true }));

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ficha de perfil...');
  });

  it('indica contactar al coordinador cuando no hay ficha asignada', () => {
    // Arrange
    vi.mocked(useMiFichaPerfil).mockReturnValue(crearMock({ sinFicha: true }));

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('No tienes una ficha de perfil asignada')).toBeInTheDocument();
    expect(screen.getByText(/Contacta al coordinador/)).toBeInTheDocument();
  });

  it('muestra una alerta accionable cuando falla la carga de la ficha', () => {
    // Arrange
    vi.mocked(useMiFichaPerfil).mockReturnValue(crearMock({ errorFicha: true, isErrorFicha: true }));

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/No pudimos cargar tu ficha de perfil/);
    expect(screen.getByRole('alert')).toHaveTextContent(/Intenta de nuevo/);
  });

  it('muestra el encabezado y las pestañas cuando hay ficha', () => {
    // Arrange
    vi.mocked(useMiFichaPerfil).mockReturnValue(crearMock({ ficha: FICHA, fichas: [FICHA] }));

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('Encabezado de la ficha')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Ítems', selected: true })).toBeInTheDocument();
    expect(screen.getByText('Panel de ítems')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('muestra el selector con la ficha activa cuando hay más de una y delega la selección', async () => {
    // Arrange
    const seleccionarFicha = vi.fn();
    const otra = { ...FICHA, id: 'f-2', tituloProyecto: 'Otro proyecto' };
    vi.mocked(useMiFichaPerfil).mockReturnValue(
      crearMock({ ficha: FICHA, fichas: [FICHA, otra], seleccionarFicha }),
    );

    // Act
    render(<EstudianteView />);
    const selector = screen.getByRole('combobox', { name: 'Ficha de perfil' });
    await userEvent.selectOptions(selector, 'f-2');

    // Assert
    expect(selector).toHaveValue('f-1');
    expect(seleccionarFicha).toHaveBeenCalledWith('f-2');
    expect(screen.getByText('Encabezado de la ficha')).toBeInTheDocument();
  });
});
