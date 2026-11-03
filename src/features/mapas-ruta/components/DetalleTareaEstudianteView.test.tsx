import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import { useTarea } from '../hooks/useTarea';
import DetalleTareaEstudianteView from './DetalleTareaEstudianteView';

vi.mock('../hooks/useTarea', () => ({ useTarea: vi.fn() }));

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
});
