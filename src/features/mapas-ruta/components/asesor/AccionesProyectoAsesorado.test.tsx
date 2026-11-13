import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../../test-utils/render';
import { useMapaRutaProyectoAsesor } from '../../hooks/useMapaRutaProyectoAsesor';
import AccionesProyectoAsesorado from './AccionesProyectoAsesorado';

vi.mock('../../hooks/useMapaRutaProyectoAsesor', () => ({ useMapaRutaProyectoAsesor: vi.fn() }));

const useMapa = vi.mocked(useMapaRutaProyectoAsesor);

const PROYECTO = { id: 'p-1', titulo: 'Sistema A' };
const MAPA = {
  id: 'm-1',
  proyectoGradoId: 'p-1',
  titulo: 'Sistema A',
  fechaInicio: '2026-03-05',
  fechaFin: '2026-08-01',
};

function configurarMapa(cambios: Record<string, unknown> = {}) {
  useMapa.mockReturnValue({
    mapa: undefined,
    cargando: false,
    sinMapa: false,
    hayError: false,
    reintentar: vi.fn(),
    ...cambios,
  } as never);
}

function renderizar() {
  return render(
    <Routes>
      <Route path="/mapas-ruta" element={<AccionesProyectoAsesorado proyecto={PROYECTO} />} />
      <Route
        path="/mapas-ruta/proyectos/:proyectoGradoId/planes-estimados"
        element={<p>Pantalla de planes estimados</p>}
      />
    </Routes>,
    { initialPath: '/mapas-ruta?q=sistema' },
  );
}

describe('AccionesProyectoAsesorado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con mapa ofrece "Ver planes estimados" y navega a la pantalla del proyecto', async () => {
    // Arrange
    configurarMapa({ mapa: MAPA });
    renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Acciones de Sistema A' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /ver planes estimados/i }));

    // Assert
    expect(screen.getByText('Pantalla de planes estimados')).toBeInTheDocument();
  });

  it('sin mapa o con error no renderiza el menú', () => {
    // Arrange
    configurarMapa({ sinMapa: true });

    // Act
    const { unmount } = renderizar();

    // Assert
    expect(screen.queryByRole('button', { name: /acciones de/i })).not.toBeInTheDocument();
    unmount();

    // Arrange
    configurarMapa({ hayError: true });

    // Act
    renderizar();

    // Assert
    expect(screen.queryByRole('button', { name: /acciones de/i })).not.toBeInTheDocument();
  });
});
