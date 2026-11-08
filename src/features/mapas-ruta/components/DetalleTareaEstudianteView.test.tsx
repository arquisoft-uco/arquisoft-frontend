import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import { useTarea } from '../hooks/useTarea';
import DetalleTareaEstudianteView from './DetalleTareaEstudianteView';

vi.mock('../hooks/useTarea', () => ({ useTarea: vi.fn() }));
vi.mock('./estudiante/CambiarEstadoTareaPanel', () => ({
  default: () => <div role="dialog" aria-label="Panel de cambio de estado" />,
}));
vi.mock('./estudiante/AgregarPlanEstimadoPanel', () => ({
  default: () => <div role="dialog" aria-label="Panel de plan estimado" />,
}));
vi.mock('./estudiante/ModificarInformacionTareaPanel', () => ({
  default: () => <div role="dialog" aria-label="Panel de edición de la tarea" />,
}));

vi.mock('./estudiante/EliminarTareaDialog', () => ({
  default: ({ onCerrar, onEliminada }: { onCerrar: () => void; onEliminada: () => void }) => (
    <div role="dialog" aria-label="Diálogo de eliminación">
      <button type="button" onClick={onCerrar}>
        Cerrar diálogo
      </button>
      <button type="button" onClick={onEliminada}>
        Simular eliminada
      </button>
    </div>
  ),
}));

const useDetalle = vi.mocked(useTarea);

const TAREA = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

function simular(parcial: Partial<ReturnType<typeof useTarea>> = {}) {
  const base = {
    tarea: TAREA,
    cargando: false,
    noEncontrada: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } satisfies ReturnType<typeof useTarea>;
  useDetalle.mockReturnValue(base);
  return base;
}

function Listado() {
  const { search } = useLocation();
  return (
    <div>
      <p>{`Listado${search}`}</p>
      <Link to="/mapas-ruta/tareas/t-1" state={{ search: '?pagina=2' }}>
        Abrir detalle
      </Link>
    </div>
  );
}

function renderizar(initialPath = '/mapas-ruta/tareas/t-1') {
  return render(
    <Routes>
      <Route path="/mapas-ruta/tareas/:id" element={<DetalleTareaEstudianteView />} />
      <Route path="/mapas-ruta" element={<Listado />} />
    </Routes>,
    { initialPath },
  );
}

describe('DetalleTareaEstudianteView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra descripción, estado, asesor con correo y las fechas del mapa de ruta', () => {
    // Arrange
    simular();

    // Act
    renderizar();

    // Assert
    expect(useDetalle).toHaveBeenCalledWith('t-1');
    expect(screen.getByRole('heading', { name: 'Entregar informe' })).toBeInTheDocument();
    expect(screen.getByText('Nueva')).toBeInTheDocument();
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('Inicio del mapa de ruta')).toBeInTheDocument();
    expect(screen.getByText('Fin del mapa de ruta')).toBeInTheDocument();
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    simular({ tarea: undefined, cargando: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con tarea no encontrada vuelve al listado sin search si entró por URL directa', async () => {
    // Arrange
    simular({ tarea: undefined, noEncontrada: true });
    const user = userEvent.setup();

    // Act
    renderizar();
    await user.click(screen.getByRole('button', { name: 'Volver a mis tareas' }));

    // Assert
    expect(screen.getByText('Listado')).toBeInTheDocument();
  });

  it('con tarea no encontrada vuelve al listado conservando el search recibido en el state', async () => {
    // Arrange
    simular({ tarea: undefined, noEncontrada: true });
    const user = userEvent.setup();
    renderizar('/mapas-ruta');

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir detalle' }));
    await user.click(screen.getByRole('button', { name: 'Volver a mis tareas' }));

    // Assert
    expect(screen.getByText('Listado?pagina=2')).toBeInTheDocument();
  });

  it('con error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    const base = simular({ tarea: undefined, hayError: true });
    const user = userEvent.setup();

    // Act
    renderizar();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(base.reintentar).toHaveBeenCalled();
  });

  it('Cambiar estado abre el panel con una tarea que admite cambios', async () => {
    // Arrange
    simular();
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de cambio de estado' })).toBeInTheDocument();
  });

  it('no ofrece Cambiar estado con tarea finalizada, cargando ni con error', () => {
    // Arrange / Act / Assert
    simular({ tarea: { ...TAREA, estado: { id: 'FINALIZADA', nombre: 'Finalizada' } } });
    const finalizada = renderizar();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
    finalizada.unmount();

    simular({ tarea: undefined, cargando: true });
    const cargando = renderizar();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
    cargando.unmount();

    simular({ tarea: undefined, hayError: true });
    renderizar();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
  });

  it('Editar tarea abre el panel, también con una tarea finalizada', async () => {
    // Arrange
    simular({ tarea: { ...TAREA, estado: { id: 'FINALIZADA', nombre: 'Finalizada' } } });
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Editar tarea' }));

    // Assert
    expect(
      screen.getByRole('dialog', { name: 'Panel de edición de la tarea' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
  });

  it.each(['NUEVA', 'EN_PROGRESO'])(
    'Eliminar tarea abre el diálogo con una tarea %s',
    async (id) => {
      // Arrange
      simular({ tarea: { ...TAREA, estado: { id, nombre: id } } });
      const user = userEvent.setup();
      renderizar();

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar tarea' }));

      // Assert
      expect(screen.getByRole('dialog', { name: 'Diálogo de eliminación' })).toBeInTheDocument();
    },
  );

  it('no ofrece Eliminar tarea finalizada, cargando, con error ni sin encontrar', () => {
    // Arrange / Act / Assert
    simular({ tarea: { ...TAREA, estado: { id: 'FINALIZADA', nombre: 'Finalizada' } } });
    const finalizada = renderizar();
    expect(screen.queryByRole('button', { name: 'Eliminar tarea' })).not.toBeInTheDocument();
    finalizada.unmount();

    simular({ tarea: undefined, cargando: true });
    const cargando = renderizar();
    expect(screen.queryByRole('button', { name: 'Eliminar tarea' })).not.toBeInTheDocument();
    cargando.unmount();

    simular({ tarea: undefined, hayError: true });
    const conError = renderizar();
    expect(screen.queryByRole('button', { name: 'Eliminar tarea' })).not.toBeInTheDocument();
    conError.unmount();

    simular({ tarea: undefined, noEncontrada: true });
    renderizar();
    expect(screen.queryByRole('button', { name: 'Eliminar tarea' })).not.toBeInTheDocument();
  });

  it('cerrar el diálogo lo quita y deja el detalle', async () => {
    // Arrange
    simular();
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole('button', { name: 'Eliminar tarea' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar diálogo' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Entregar informe' })).toBeInTheDocument();
  });

  it('al eliminar vuelve al listado conservando el search recibido en el state', async () => {
    // Arrange
    simular();
    const user = userEvent.setup();
    renderizar('/mapas-ruta');
    await user.click(screen.getByRole('link', { name: 'Abrir detalle' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar tarea' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Simular eliminada' }));

    // Assert
    expect(screen.getByText('Listado?pagina=2')).toBeInTheDocument();
  });

  it('no ofrece Editar tarea cargando, con error ni sin encontrar', () => {
    // Arrange / Act / Assert
    simular({ tarea: undefined, cargando: true });
    const cargando = renderizar();
    expect(screen.queryByRole('button', { name: 'Editar tarea' })).not.toBeInTheDocument();
    cargando.unmount();

    simular({ tarea: undefined, hayError: true });
    const conError = renderizar();
    expect(screen.queryByRole('button', { name: 'Editar tarea' })).not.toBeInTheDocument();
    conError.unmount();

    simular({ tarea: undefined, noEncontrada: true });
    renderizar();
    expect(screen.queryByRole('button', { name: 'Editar tarea' })).not.toBeInTheDocument();
  });
  it('Agregar plan estimado abre el panel, también con una tarea finalizada', async () => {
    // Arrange
    simular({ tarea: { ...TAREA, estado: { id: 'FINALIZADA', nombre: 'Finalizada' } } });
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Agregar plan estimado' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de plan estimado' })).toBeInTheDocument();
  });
});
