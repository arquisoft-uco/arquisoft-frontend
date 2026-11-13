import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import { useMapaRutaProyectoAsesor } from '../hooks/useMapaRutaProyectoAsesor';
import TareasMapaRutaAsesorView from './TareasMapaRutaAsesorView';

vi.mock('../hooks/useMapaRutaProyectoAsesor', () => ({ useMapaRutaProyectoAsesor: vi.fn() }));
vi.mock('./asesor/ConsultarTareasMapaRutaAsesor', () => ({
  default: ({ mapaRutaId }: { mapaRutaId: string }) => <p>Listado del mapa {mapaRutaId}</p>,
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
        path="/mapas-ruta/proyectos/:proyectoGradoId/tareas"
        element={<TareasMapaRutaAsesorView />}
      />
      <Route path="/mapas-ruta" element={<p>Listado de mapas</p>} />
    </Routes>,
    { initialPath: '/mapas-ruta/proyectos/p-1/tareas' },
  );
}

describe('TareasMapaRutaAsesorView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con mapa muestra la cabecera, el título del proyecto, la miga y el listado', () => {
    // Arrange
    configurarMapa({ mapa: MAPA });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Tareas del mapa de ruta' })).toBeInTheDocument();
    expect(screen.getByText(/Sistema A · Inicio .*2026 · Fin .*2026/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mapas de ruta' })).toBeInTheDocument();
    expect(screen.getByText('Listado del mapa m-1')).toBeInTheDocument();
  });

  it('sin mapa muestra el vacío y "Volver a mapas de ruta" regresa al listado', async () => {
    // Arrange
    configurarMapa({ sinMapa: true });
    renderizar();
    expect(screen.getByText('Aún no hay mapa de ruta')).toBeInTheDocument();

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
