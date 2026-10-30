import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import Entregables from './Entregables';

vi.mock('./services/entregablesService', () => ({
  entregablesService: {
    getEstadosEntregable: vi.fn().mockResolvedValue([]),
    consultarEntregablesAsesor: vi.fn().mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    }),
  },
}));

function renderizar(ruta = '/entregables') {
  return render(
    <Routes>
      <Route path="/entregables" element={<Entregables />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: ruta },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('Entregables', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el asesor ve el encabezado de entregables', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Entregables' }),
    ).toBeInTheDocument();
  });

  it('por defecto muestra el listado y ?vista=estados muestra el catálogo', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    const { unmount } = renderizar();

    // Assert
    expect(await screen.findByText('Aún no tienes entregables generados')).toBeInTheDocument();
    expect(
      screen.queryByRole('table', { name: 'Estados de un entregable' }),
    ).not.toBeInTheDocument();
    unmount();

    // Act
    renderizar('/entregables?vista=estados');

    // Assert
    expect(await screen.findByText('Aún no hay estados de entregable')).toBeInTheDocument();
  });

  it('una vista desconocida cae al listado', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar('/entregables?vista=otra');

    // Assert
    expect(await screen.findByText('Aún no tienes entregables generados')).toBeInTheDocument();
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    // Arrange
    entrarComo(Rol.Asesor, Rol.Coordinador);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Selector de rol')).toBeInTheDocument();
  });

  it('un rol sin vista redirige a /forbidden', () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });
});
