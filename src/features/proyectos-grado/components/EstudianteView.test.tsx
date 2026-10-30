import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import EstudianteView from './EstudianteView';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';
import type { ProyectoGrado } from '../models/ProyectoGrado';

vi.mock('../../../shared/hooks/useMisProyectosGrado', () => ({ useMisProyectosGrado: vi.fn() }));
vi.mock('./estudiante/HistorialEstadosProyectoPanel', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <p>Historial de {proyectoGradoId}</p>
  ),
}));
vi.mock('./estudiante/HistorialAsesoresProyectoPanel', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <p>Asesores de {proyectoGradoId}</p>
  ),
}));
vi.mock('./estudiante/AsesorActualResumen', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <p>Asesor actual de {proyectoGradoId}</p>
  ),
}));

vi.mock('./estudiante/CompanerosProyectoResumen', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <p>Estudiantes de {proyectoGradoId}</p>
  ),
}));

type Hook = ReturnType<typeof useMisProyectosGrado>;

const UNO: ProyectoGrado = {
  id: 'p-1',
  fichaPerfil: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estado: { id: 'EN_CURSO', nombre: 'En curso' },
};
const DOS: ProyectoGrado = { ...UNO, id: 'p-2', tituloProyecto: 'Otro proyecto' };

function mockearHook(parcial: Partial<Record<keyof Hook, unknown>> = {}) {
  vi.mocked(useMisProyectosGrado).mockReturnValue({
    proyecto: UNO,
    proyectos: [UNO],
    seleccionarProyecto: vi.fn(),
    cargado: true,
    sinProyecto: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as Hook);
}

describe('EstudianteView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con un proyecto muestra título y estado, sin selector', () => {
    // Arrange
    mockearHook();

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('heading', { name: /Sistema de monitoreo/ })).toBeInTheDocument();
    expect(screen.getAllByText('En curso').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('complementary', { name: 'Resumen del proyecto de grado' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Proyecto de grado')).not.toBeInTheDocument();
  });

  it('con varios proyectos muestra el selector y al elegir otro llama seleccionarProyecto', async () => {
    // Arrange
    const user = userEvent.setup();
    const seleccionarProyecto = vi.fn();
    mockearHook({ proyectos: [UNO, DOS], seleccionarProyecto });
    render(<EstudianteView />);

    // Act
    await user.selectOptions(screen.getByLabelText('Proyecto de grado'), 'p-2');

    // Assert
    expect(seleccionarProyecto).toHaveBeenCalledWith('p-2');
  });

  it('muestra la pestaña del historial con su panel y el resumen, sin enlace ni acciones', () => {
    // Arrange
    mockearHook();

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('tab', { name: 'Historial de estados' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Historial de p-1')).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Resumen del proyecto de grado' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /historial de estados/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('ofrece la pestaña de asesores con su panel del proyecto activo y el resumen lleva el asesor actual', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearHook();
    render(<EstudianteView />);

    // Act
    await user.click(screen.getByRole('tab', { name: 'Historial de asesores' }));

    // Assert
    expect(screen.getByRole('tab', { name: 'Historial de asesores' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Asesores de p-1')).toBeInTheDocument();
    expect(screen.getByText('Asesor actual de p-1')).toBeInTheDocument();
  });

  it('el panel del historial sigue al proyecto elegido', () => {
    // Arrange
    mockearHook({ proyecto: DOS, proyectos: [UNO, DOS] });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('Historial de p-2')).toBeInTheDocument();
  });

  it('el resumen lleva la sección de estudiantes del proyecto activo', () => {
    // Arrange
    mockearHook({ proyecto: DOS, proyectos: [UNO, DOS] });

    // Act
    render(<EstudianteView />);

    // Assert
    const resumen = screen.getByRole('complementary', { name: 'Resumen del proyecto de grado' });
    expect(within(resumen).getByText('Estudiantes del proyecto')).toBeInTheDocument();
    expect(within(resumen).getByText('Estudiantes de p-2')).toBeInTheDocument();
  });

  it('cargando muestra el esqueleto', () => {
    // Arrange
    mockearHook({ cargado: false, proyecto: null, proyectos: [] });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin proyectos muestra el estado vacío', () => {
    // Arrange
    mockearHook({ sinProyecto: true, proyecto: null, proyectos: [] });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('Aún no perteneces a un proyecto de grado')).toBeInTheDocument();
  });

  it('con error muestra el ErrorState y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const reintentar = vi.fn();
    mockearHook({ hayError: true, proyecto: null, proyectos: [], reintentar });
    render(<EstudianteView />);

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(reintentar).toHaveBeenCalledTimes(1);
  });
});
