import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Navigate, Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import VersionesRepositorio from './VersionesRepositorio';

vi.mock('./services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: {
    consultarVersionesRepositorio: vi.fn().mockResolvedValue([]),
    solicitarCargaVersion: vi.fn(),
    cargarArchivoVersion: vi.fn(),
    subirVersion: vi.fn(),
  },
}));

const RUTA = '/repositorio-artefactos/r-1/versiones';

function renderizar(state?: unknown) {
  return render(
    <Routes>
      <Route path="/origen" element={<Navigate to={RUTA} state={state} replace />} />
      <Route
        path="/repositorio-artefactos/:repositorioId/versiones"
        element={<VersionesRepositorio />}
      />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/origen' },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('VersionesRepositorio', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el administrador ve la pantalla y la miga vuelve al listado con su búsqueda', async () => {
    // Arrange
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);

    // Act
    renderizar({
      search: '?q=alfa&pagina=2',
      repositorio: { id: 'r-1', nombre: 'Repositorio Alfa' },
    });

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Versiones del repositorio' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Repositorio de artefactos' })).toHaveAttribute(
      'href',
      '/repositorio-artefactos?q=alfa&pagina=2',
    );
    expect(screen.getAllByText('Repositorio Alfa').length).toBeGreaterThan(0);
  });

  it('sin state usa la miga genérica y el listado sin búsqueda', async () => {
    // Arrange
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);

    // Act
    renderizar();

    // Assert
    await screen.findByRole('heading', { level: 1, name: 'Versiones del repositorio' });
    expect(screen.getByRole('link', { name: 'Repositorio de artefactos' })).toHaveAttribute(
      'href',
      '/repositorio-artefactos',
    );
    expect(screen.getAllByText('Repositorio').length).toBeGreaterThan(0);
  });

  it('el botón de la cabecera abre el panel para subir una versión', async () => {
    // Arrange
    const user = userEvent.setup();
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);
    renderizar();

    // Act
    await user.click(await screen.findByRole('button', { name: 'Subir versión' }));

    // Assert
    expect(await screen.findByRole('dialog', { name: 'Subir versión' })).toBeInTheDocument();
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    // Arrange
    entrarComo(Rol.Administrador, Rol.Asesor);

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
