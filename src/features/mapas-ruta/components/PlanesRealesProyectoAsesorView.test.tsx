import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import { useMapaRutaProyectoAsesor } from '../hooks/useMapaRutaProyectoAsesor';
import PlanesRealesProyectoAsesorView from './PlanesRealesProyectoAsesorView';

vi.mock('../hooks/useMapaRutaProyectoAsesor', () => ({ useMapaRutaProyectoAsesor: vi.fn() }));
vi.mock('./asesor/ConsultarPlanesRealesProyectoAsesor', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <p>Listado del proyecto {proyectoGradoId}</p>
  ),
}));

const useMapa = vi.mocked(useMapaRutaProyectoAsesor);

const MAPA = {
  id: 'm-1',
  proyectoGradoId: 'p-1',
  titulo: 'Sistema A',
  fechaInicio: '2026-03-05',
  fechaFin: '2026-08-01',
};

function configurarMapa(cambios: Record<string, unknown> = {}) {
  const base = {
    mapa: undefined,
    cargando: false,
    sinMapa: false,
    hayError: false,
    reintentar: vi.fn(),
    ...cambios,
  };
  useMapa.mockReturnValue(base as never);
  return base;
}

function renderizar() {
  return render(
    <Routes>
      <Route
        path="/mapas-ruta/proyectos/:proyectoGradoId/planes-reales"
        element={<PlanesRealesProyectoAsesorView />}
      />
      <Route
        path="/mapas-ruta/proyectos/:proyectoGradoId/tareas"
        element={<p>Tareas del proyecto</p>}
      />
      <Route path="/mapas-ruta" element={<p>Listado de mapas</p>} />
    </Routes>,
    { initialPath: '/mapas-ruta/proyectos/p-1/planes-reales' },
  );
}

describe('PlanesRealesProyectoAsesorView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con mapa muestra la cabecera, el título del proyecto, la miga y el listado', () => {
    // Arrange
    configurarMapa({ mapa: MAPA });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Planes reales del proyecto' })).toBeInTheDocument();
    expect(screen.getByText(/Sistema A · Tiempo real/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mapas de ruta' })).toBeInTheDocument();
    expect(screen.getByText('Listado del proyecto p-1')).toBeInTheDocument();
  });

  it('"Ver tareas" navega a las tareas del proyecto', async () => {
    // Arrange
    configurarMapa({ mapa: MAPA });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /ver tareas/i }));

    // Assert
    expect(screen.getByText('Tareas del proyecto')).toBeInTheDocument();
  });

  it('sin mapa muestra el vacío y "Volver a mapas de ruta" regresa al listado', async () => {
    // Arrange
    configurarMapa({ sinMapa: true });
    renderizar();
    expect(screen.getByText('Aún no hay mapa de ruta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver tareas/i })).not.toBeInTheDocument();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /volver a mapas de ruta/i }));

    // Assert
    expect(screen.getByText('Listado de mapas')).toBeInTheDocument();
  });

  it('ante un error del mapa muestra "Reintentar" y lo invoca', async () => {
    // Arrange
    const { reintentar } = configurarMapa({ hayError: true });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(reintentar).toHaveBeenCalledTimes(1);
  });
});
