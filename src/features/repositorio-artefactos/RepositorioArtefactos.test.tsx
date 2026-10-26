import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import RepositorioArtefactos from './RepositorioArtefactos';

vi.mock('./services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: {
    consultarRepositoriosAdministrador: vi.fn().mockResolvedValue({
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

function renderizar() {
  return render(
    <Routes>
      <Route path="/repositorio-artefactos" element={<RepositorioArtefactos />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/repositorio-artefactos' },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('RepositorioArtefactos', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el administrador ve el encabezado del repositorio de artefactos', async () => {
    // Arrange
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);

    // Act
    renderizar();

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Repositorio de artefactos' }),
    ).toBeInTheDocument();
  });

  it('el botón Generar repositorio abre el panel de generación', async () => {
    // Arrange
    const user = userEvent.setup();
    entrarComo(Rol.Administrador);
    setActiveRole(Rol.Administrador);
    renderizar();

    // Act
    await user.click(await screen.findByRole('button', { name: 'Generar repositorio' }));

    // Assert
    expect(await screen.findByRole('dialog', { name: 'Generar repositorio' })).toBeInTheDocument();
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
