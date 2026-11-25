import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Navigate, Route, Routes } from 'react-router';
import { render, screen, within } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import { useEvaluacionesFichaAsesor } from '../hooks/useEvaluacionesFichaAsesor';
import { useHistorialEstadosFichaAsesor } from '../hooks/useHistorialEstadosFichaAsesor';
import AsesorFichaDetalleView from './AsesorFichaDetalleView';

vi.mock('../hooks/useEstudiantesVinculados', () => ({ useEstudiantesVinculados: vi.fn() }));
vi.mock('../hooks/useEvaluacionesFichaAsesor', () => ({
  useEvaluacionesFichaAsesor: vi.fn(),
}));
vi.mock('../hooks/useHistorialEstadosFichaAsesor', () => ({
  useHistorialEstadosFichaAsesor: vi.fn(),
}));
vi.mock('./asesor-ficha/ItemsFichaAsesorPanel', () => ({ default: () => <div>Panel ítems</div> }));

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles } } });
  if (roles.length === 1) setActiveRole(roles[0]);
}

const RESUMEN = {
  id: 'f-1',
  titulo: 'Ficha del asesor',
  estadoId: 'EN_CONSTRUCCION',
  estadoNombre: 'En Construccion',
};

function renderizar(rutaInicial: string, resumen: typeof RESUMEN = RESUMEN, entrada?: string) {
  return render(
    <Routes>
      {entrada && (
        <Route
          path="/entrada"
          element={<Navigate to={entrada} replace state={{ resumen, search: '?q=ficha' }} />}
        />
      )}
      <Route path="/fichas-perfil" element={<div>Listado de fichas</div>} />
      <Route
        path="/origen"
        element={
          <Link to="/fichas-perfil/f-1/items" state={{ resumen, search: '' }}>
            Abrir
          </Link>
        }
      />
      <Route path="/fichas-perfil/:id" element={<AsesorFichaDetalleView />}>
        <Route path="items" element={<div>Panel ítems</div>} />
        <Route path="estados" element={<div>Panel estados</div>} />
      </Route>
    </Routes>,
    { initialPath: rutaInicial },
  );
}

function renderizarConContexto(rutaDetalle: string) {
  return renderizar('/entrada', RESUMEN, rutaDetalle);
}

describe('AsesorFichaDetalleView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    entrarComo(Rol.AsesorFicha);
    vi.mocked(useHistorialEstadosFichaAsesor).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useHistorialEstadosFichaAsesor>);
    vi.mocked(useEvaluacionesFichaAsesor).mockReturnValue({
      data: [],
    } as never);
  });

  it('ofrece solo las pestañas Ítems, Revisiones, Observaciones y Estados', () => {
    // Act
    renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    const pestanas = screen.getByRole('navigation', { name: 'Secciones de la ficha' });
    expect(
      within(pestanas)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Ítems', 'Revisiones', 'Observaciones', 'Estados']);
  });

  it('cambiar de pestaña conserva el resumen aunque el state ya no viaje', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/origen');
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Act
    await user.click(screen.getByRole('link', { name: 'Estados' }));

    // Assert
    expect(screen.getByText('Panel estados')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha del asesor' })).toBeInTheDocument();
    expect(screen.getAllByText('En Construccion').length).toBeGreaterThan(0);
  });

  it('el encabezado refleja el estado actual del historial por encima del que trajo el state', async () => {
    // Arrange
    vi.mocked(useHistorialEstadosFichaAsesor).mockReturnValue({
      data: [{ id: 'e-9', nombre: 'Descartada', fechaActualizacion: '2026-10-01T10:00:00' }],
    } as ReturnType<typeof useHistorialEstadosFichaAsesor>);
    const user = userEvent.setup();
    renderizar('/origen');

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Assert
    expect(screen.getAllByText('Descartada').length).toBeGreaterThan(0);
    expect(screen.queryByText('En Construccion')).not.toBeInTheDocument();
  });

  it('«Cambiar estado» del panel lateral lleva a la pestaña Estados', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/origen');
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(screen.getByText('Panel estados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
  });

  it('con la ficha disponible oculta «Cambiar estado» si hay evaluaciones en curso o finalizadas y lo ofrece si no', async () => {
    // Arrange
    const disponible = {
      ...RESUMEN,
      estadoId: 'DISPONIBLE_PARA_EVALUACION',
      estadoNombre: 'Disponible Para Evaluacion',
    };
    vi.mocked(useEvaluacionesFichaAsesor).mockReturnValue({
      data: [{ estadoEvaluacionId: 'EN_EVALUACION' }],
    } as never);
    const user = userEvent.setup();
    const bloqueada = renderizar('/origen', disponible);
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Assert
    expect(screen.getByText('Panel ítems')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
    bloqueada.unmount();

    // Arrange
    vi.mocked(useEvaluacionesFichaAsesor).mockReturnValue({
      data: [{ estadoEvaluacionId: 'DESCARTADA' }],
    } as never);
    renderizar('/origen', disponible);

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Cambiar estado' })).toBeInTheDocument();
  });

  it('no ofrece «Cambiar estado» si la ficha está en un estado final', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/origen', { ...RESUMEN, estadoId: 'APROBADA', estadoNombre: 'Aprobada' });

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Assert
    expect(screen.getByText('Panel ítems')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
  });

  it('sin state ni snapshot redirige al listado de fichas', () => {
    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
    expect(screen.queryByText('Panel ítems')).not.toBeInTheDocument();
  });

  it('sin state pero con snapshot vigente pinta el detalle sin redirigir', () => {
    // Arrange
    renderizarConContexto('/fichas-perfil/f-1/items').unmount();

    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha del asesor' })).toBeInTheDocument();
    expect(screen.queryByText('Listado de fichas')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fichas de perfil' })).toHaveAttribute(
      'href',
      '/fichas-perfil?q=ficha',
    );
  });
});
