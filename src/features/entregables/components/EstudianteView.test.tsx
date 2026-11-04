import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import EstudianteView from './EstudianteView';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';

vi.mock('../../../shared/hooks/useMisProyectosGrado', () => ({
  useMisProyectosGrado: vi.fn(),
}));
vi.mock('./estudiante/ConsultarEntregablesEstudiante', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <div>Listado de {proyectoGradoId}</div>
  ),
}));

function crearProyecto(id: string) {
  return {
    id,
    fichaPerfil: `f-${id}`,
    tituloProyecto: `Proyecto ${id}`,
    estado: { id: 'ACTIVO', nombre: 'Activo' },
  };
}

function mockHook(parcial: Partial<ReturnType<typeof useMisProyectosGrado>> = {}) {
  const hook = {
    proyecto: null,
    proyectos: [],
    seleccionarProyecto: vi.fn(),
    cargado: true,
    sinProyecto: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useMisProyectosGrado>;
  vi.mocked(useMisProyectosGrado).mockReturnValue(hook);
  return hook;
}

describe('EntregablesEstudianteView', () => {
  beforeEach(() => {
    vi.mocked(useMisProyectosGrado).mockReset();
  });

  it('sin proyecto de grado muestra el vacío y no monta el listado', () => {
    // Arrange
    mockHook({ sinProyecto: true });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('Aún no perteneces a un proyecto de grado')).toBeInTheDocument();
    expect(screen.queryByText(/Listado de/)).not.toBeInTheDocument();
  });

  it('si fallan los proyectos muestra el error y "Reintentar" los vuelve a pedir', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ hayError: true });
    render(<EstudianteView />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu proyecto de grado');
    expect(hook.reintentar).toHaveBeenCalledTimes(1);
  });

  it('con un proyecto no hay selector y el listado recibe su id', () => {
    // Arrange
    const p1 = crearProyecto('p-1');
    mockHook({ proyecto: p1, proyectos: [p1] });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('heading', { name: 'Entregables' })).toBeInTheDocument();
    expect(screen.getByText('Listado de p-1')).toBeInTheDocument();
    expect(screen.queryByLabelText('Proyecto de grado')).not.toBeInTheDocument();
  });

  it('con varios proyectos aparece el selector y elegir otro lo selecciona', async () => {
    // Arrange
    const user = userEvent.setup();
    const p1 = crearProyecto('p-1');
    const hook = mockHook({ proyecto: p1, proyectos: [p1, crearProyecto('p-2')] });
    render(<EstudianteView />);

    // Act
    await user.selectOptions(screen.getByLabelText('Proyecto de grado'), 'p-2');

    // Assert
    expect(hook.seleccionarProyecto).toHaveBeenCalledWith('p-2');
  });
});
