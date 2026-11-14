import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen, within } from '../../test-utils/render';
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
      content: [
        {
          id: 'd-1',
          fechaPublicacion: '2026-11-01T10:00:00Z',
          entregableProyectoGrado: { id: 'e-1', versionEntregable: 2 },
          bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
          estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      empty: false,
    }),
    consultarAutoresDocumentacion: vi.fn().mockResolvedValue([]),
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
      expect(await screen.findByRole('table', { name: 'Documentaciones' })).toBeInTheDocument();
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
    await screen.findByRole('table', { name: 'Documentaciones' });
    expect(screen.queryByRole('group', { name: 'Estado' })).not.toBeInTheDocument();
  });

  it('solo el bibliotecario ve la acción "Ver autores"', async () => {
    // Arrange
    entrarComo(Rol.Bibliotecario);

    // Act
    renderizar();

    // Assert
    const tabla = within(await screen.findByRole('table', { name: 'Documentaciones' }));
    expect(
      tabla.getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
    ).toBeInTheDocument();
  });

  it.each([Rol.Asesor, Rol.Coordinador, Rol.Estudiante])(
    'el rol %s no ve la acción "Ver autores"',
    async (rol) => {
      // Arrange
      entrarComo(rol);

      // Act
      renderizar();

      // Assert
      await screen.findByRole('table', { name: 'Documentaciones' });
      expect(
        screen.queryByRole('button', { name: /Acciones de la documentación/ }),
      ).not.toBeInTheDocument();
    },
  );
});
