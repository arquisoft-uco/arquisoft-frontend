import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import Artefactos from './Artefactos';

vi.mock('./services/artefactosService', () => ({
  artefactosService: {
    getEstadosRevisionAsesor: vi.fn().mockResolvedValue([]),
    consultarVersionesRepositorioAsesor: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }),
    consultarVersionesArtefactoAsesor: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }),
    consultarArtefactosEstudiante: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }),
    consultarVersionesArtefactoEstudiante: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }),
    getParticipacionesEstudiante: vi.fn().mockResolvedValue([]),
    consultarArtefactosAsesor: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }),
    consultarRevisionesAsesor: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    }),
  },
}));

function renderizar(ruta = '/artefactos') {
  return render(
    <Routes>
      <Route path="/artefactos" element={<Artefactos />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: ruta },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('Artefactos', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el asesor ve el encabezado de revisiones de artefactos', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Artefactos' }),
    ).toBeInTheDocument();
  });

  it('el asesor ve por defecto las revisiones realizadas y con ?vista=estados el catálogo', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    const { unmount } = renderizar();
    const porDefecto = await screen.findByRole('link', { name: 'Revisiones realizadas' });
    unmount();
    renderizar('/artefactos?vista=estados');

    // Assert
    expect(porDefecto).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByText('Aún no hay estados de revisión')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Estados de revisión' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('con ?vista=versiones el asesor ve la pestaña de versiones de repositorio', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar('/artefactos?vista=versiones');

    // Assert
    expect(await screen.findByText('Aún no hay versiones de repositorio')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Versiones de repositorio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Revisiones realizadas' })).toBeInTheDocument();
  });

  it('con ?vista=versiones-artefactos el asesor ve la pestaña de versiones de artefactos', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar('/artefactos?vista=versiones-artefactos');

    // Assert
    expect(await screen.findByText('Aún no hay versiones de artefactos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Versiones de artefactos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    // Arrange
    entrarComo(Rol.Asesor, Rol.Coordinador);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Selector de rol')).toBeInTheDocument();
  });

  it('el estudiante ve el listado de artefactos de sus proyectos', async () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Aún no hay artefactos en tus proyectos')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Revisiones realizadas' })).not.toBeInTheDocument();
  });

  it('con ?vista=participacion el estudiante ve la pestaña de participación', async () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar('/artefactos?vista=participacion');

    // Assert
    expect(await screen.findByText('Aún no participas en artefactos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Participación' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('con ?vista=versiones-artefactos el estudiante ve la pestaña de versiones de artefactos', async () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar('/artefactos?vista=versiones-artefactos');

    // Assert
    expect(await screen.findByText('Aún no hay versiones de artefactos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Versiones de artefactos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Mis artefactos' })).toBeInTheDocument();
  });

  it('un rol sin vista redirige a /forbidden', () => {
    // Arrange
    entrarComo(Rol.Coordinador);
    setActiveRole(Rol.Coordinador);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });
});
