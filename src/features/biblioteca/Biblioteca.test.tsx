import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import Biblioteca from './Biblioteca';

vi.mock('./services/bibliotecaService', () => ({
  bibliotecaService: {
    getEstadosDocumentacion: vi.fn().mockResolvedValue([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'PUBLICADO', nombre: 'Publicado', descripcion: '' },
    ]),
    consultarDocumentaciones: vi.fn().mockResolvedValue({
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

function renderizar() {
  return render(
    <Routes>
      <Route path="/biblioteca" element={<Biblioteca />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/biblioteca' },
  );
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('Biblioteca', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('sin rol activo redirige al selector de rol', async () => {
    // Arrange
    setAuthenticatedUser({
      tokenParsed: { sub: 'u', realm_access: { roles: [Rol.Asesor, Rol.Estudiante] } },
    });

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Selector de rol')).toBeInTheDocument();
  });

  it.each([Rol.Asesor, Rol.Bibliotecario, Rol.Coordinador, Rol.Estudiante])(
    'el rol %s ve la pantalla de Biblioteca',
    async (rol) => {
      // Arrange
      entrarComo(rol);

      // Act
      renderizar();

      // Assert
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Biblioteca' }),
      ).toBeInTheDocument();
      expect(await screen.findByText('Aún no hay documentaciones')).toBeInTheDocument();
    },
  );

  it('un rol sin vista redirige a /forbidden', async () => {
    // Arrange
    entrarComo(Rol.Administrador);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
  });

  it('el bibliotecario ve el filtro de estado', async () => {
    // Arrange
    entrarComo(Rol.Bibliotecario);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByRole('group', { name: 'Estado' })).toBeInTheDocument();
  });

  it('un rol distinto del bibliotecario no ve el filtro de estado', async () => {
    // Arrange
    entrarComo(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    await screen.findByText('Aún no hay documentaciones');
    expect(screen.queryByRole('group', { name: 'Estado' })).not.toBeInTheDocument();
  });
});
