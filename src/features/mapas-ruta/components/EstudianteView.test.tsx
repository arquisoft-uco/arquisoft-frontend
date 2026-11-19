import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import type { ProyectoGradoEstudiante } from '../../../shared/models/ProyectoGradoEstudiante';
import { useMapaRutaEstudiante } from '../hooks/useMapaRutaEstudiante';
import EstudianteView from './EstudianteView';

vi.mock('../hooks/useMapaRutaEstudiante', () => ({ useMapaRutaEstudiante: vi.fn() }));
vi.mock('./estudiante/AsignarTareaPanel', () => ({
  default: () => <div>Panel nueva tarea</div>,
}));
vi.mock('./estudiante/ConsultarTareasMapaRuta', () => ({
  default: ({ mapaRutaId }: { mapaRutaId: string }) => <div>Listado de tareas {mapaRutaId}</div>,
}));

const useHook = vi.mocked(useMapaRutaEstudiante);

type Retorno = ReturnType<typeof useMapaRutaEstudiante>;

function simular(parcial: Partial<Retorno>) {
  useHook.mockReturnValue({
    proyecto: null,
    proyectos: [],
    seleccionarProyecto: vi.fn(),
    mapa: undefined,
    cargando: false,
    sinMapa: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as Retorno);
}

describe('EstudianteView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga muestra el encabezado y el estado de carga accesible', () => {
    // Arrange
    simular({ cargando: true });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Mi mapa de ruta' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu mapa de ruta…');
  });

  it('sin mapa muestra el estado vacío y ningún error', () => {
    // Arrange
    simular({ sinMapa: true });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('Aún no tienes un mapa de ruta')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/Listado de tareas/)).not.toBeInTheDocument();
  });

  it('con error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    const reintentar = vi.fn();
    simular({ hayError: true, reintentar });
    const user = userEvent.setup();

    // Act
    render(<EstudianteView />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu mapa de ruta');
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('con datos muestra el título del proyecto y las fechas de inicio y fin', () => {
    // Arrange
    simular({
      mapa: {
        id: 'm-1',
        proyectoGradoId: 'p-1',
        titulo: 'Sistema A',
        fechaInicio: '2026-03-05',
        fechaFin: '2026-08-01',
      },
    });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: 'Sistema A' })).toBeInTheDocument();
    expect(screen.getByText('Fecha de inicio').nextElementSibling).toHaveTextContent('2026');
    expect(screen.getByText('Fecha de fin').nextElementSibling).toHaveTextContent('2026');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Listado de tareas m-1')).toBeInTheDocument();
  });

  it('con varios proyectos muestra el selector y al elegir otro lo notifica; con uno no aparece', async () => {
    // Arrange
    const seleccionarProyecto = vi.fn();
    const proyecto = (id: string, titulo: string): ProyectoGradoEstudiante => ({
      id,
      fichaPerfil: `f-${id}`,
      tituloProyecto: titulo,
      estado: { id: 'e-1', nombre: 'Activo' },
    });
    const proyectos = [proyecto('p-1', 'Sistema A'), proyecto('p-2', 'Sistema B')];
    simular({ proyecto: proyectos[0], proyectos, seleccionarProyecto });
    const user = userEvent.setup();
    const { unmount } = render(<EstudianteView />);

    // Act
    await user.selectOptions(screen.getByRole('combobox', { name: 'Proyecto de grado' }), 'p-2');
    unmount();
    simular({ proyecto: proyectos[0], proyectos: [proyectos[0]] });
    render(<EstudianteView />);

    // Assert
    expect(seleccionarProyecto).toHaveBeenCalledWith('p-2');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con mapa, Nueva tarea abre el panel; sin mapa el botón no existe', async () => {
    // Arrange
    simular({
      mapa: {
        id: 'm-1',
        proyectoGradoId: 'p-1',
        titulo: 'Sistema A',
        fechaInicio: '2026-03-05',
        fechaFin: '2026-08-01',
      },
    });
    const user = userEvent.setup();
    const { unmount } = render(<EstudianteView />);

    // Act
    expect(screen.queryByText('Panel nueva tarea')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nueva tarea' }));
    expect(screen.getByText('Panel nueva tarea')).toBeInTheDocument();
    unmount();
    simular({ sinMapa: true });
    render(<EstudianteView />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Nueva tarea' })).not.toBeInTheDocument();
  });
});
