import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar: vi.fn(), descargando: false }),
}));
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
    subirVersion: vi.fn(),
  },
}));

vi.mock('../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
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
      <Route path="/repositorio-artefactos" element={<p>Listado de repositorios</p>} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
    </Routes>,
    { initialPath: '/origen' },
  );
}

const STATE = {
  search: '?q=alfa&pagina=2',
  repositorio: { id: 'r-1', nombre: 'Repositorio Alfa' },
};

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

  it('sin state ni snapshot redirige al listado de repositorios', async () => {
    // Arrange
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Listado de repositorios')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Versiones del repositorio' }),
    ).not.toBeInTheDocument();
  });

  it('sin state pero con snapshot vigente pinta la pantalla con la miga y el nombre', async () => {
    // Arrange
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);
    renderizar(STATE).unmount();

    // Act
    renderizar();

    // Assert
    await screen.findByRole('heading', { level: 1, name: 'Versiones del repositorio' });
    expect(screen.getByRole('link', { name: 'Repositorio de artefactos' })).toHaveAttribute(
      'href',
      '/repositorio-artefactos?q=alfa&pagina=2',
    );
    expect(screen.getAllByText('Repositorio Alfa').length).toBeGreaterThan(0);
    expect(screen.queryByText('Listado de repositorios')).not.toBeInTheDocument();
  });

  it('el botón de la cabecera abre el panel para subir una versión', async () => {
    // Arrange
    const user = userEvent.setup();
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);
    renderizar(STATE);

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

  it('un rol sin vista muestra Acceso denegado', () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });
});
