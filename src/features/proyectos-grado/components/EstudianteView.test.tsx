import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import EstudianteView from './EstudianteView';
import { useMisProyectosGrado } from '../hooks/useMisProyectosGrado';
import type { ProyectoGrado } from '../models/ProyectoGrado';

vi.mock('../hooks/useMisProyectosGrado', () => ({ useMisProyectosGrado: vi.fn() }));

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
