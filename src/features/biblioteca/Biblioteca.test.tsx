import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
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
          tituloProyecto: 'Sistema de riego',
          autores: [],
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
    cambiarEstadoDocumentacion: vi.fn().mockResolvedValue(undefined),
  },
}));

function renderizar() {
  return render(
    <Routes>
      <Route path="/biblioteca" element={<Biblioteca />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
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

  it('un rol sin vista muestra Acceso denegado', async () => {
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
    expect(
      screen.queryByRole('button', { name: '¿Qué significa cada estado?' }),
    ).not.toBeInTheDocument();
  });

  it('el bibliotecario ve el botón para consultar los estados de una documentación', async () => {
    // Arrange
    entrarComo(Rol.Bibliotecario);

    // Act
    renderizar();

    // Assert
    expect(
      await screen.findByRole('button', { name: '¿Qué significa cada estado?' }),
    ).toBeInTheDocument();
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

  it('el bibliotecario ve en una fila publicada la acción para marcarla como no publicada', async () => {
    // Arrange
    const user = userEvent.setup();
    entrarComo(Rol.Bibliotecario);
    renderizar();

    // Act
    const tabla = within(await screen.findByRole('table', { name: 'Documentaciones' }));
    await user.click(
      tabla.getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
    );

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Marcar como no publicada' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Publicar' })).not.toBeInTheDocument();
  });

  it.each([Rol.Asesor, Rol.Coordinador, Rol.Estudiante, Rol.Bibliotecario])(
    'el rol %s ve "Descargar" en el menú de la fila',
    async (rol) => {
      // Arrange
      const user = userEvent.setup();
      entrarComo(rol);
      renderizar();

      // Act
      const tabla = within(await screen.findByRole('table', { name: 'Documentaciones' }));
      await user.click(
        tabla.getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
      );

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Descargar' })).toBeInTheDocument();
    },
  );

  it.each([Rol.Asesor, Rol.Coordinador, Rol.Estudiante])(
    'el rol %s no ve la acción "Ver autores" en el menú',
    async (rol) => {
      // Arrange
      const user = userEvent.setup();
      entrarComo(rol);
      renderizar();

      // Act
      const tabla = within(await screen.findByRole('table', { name: 'Documentaciones' }));
      await user.click(
        tabla.getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
      );

      // Assert
      expect(screen.queryByRole('menuitem', { name: 'Ver autores' })).not.toBeInTheDocument();
    },
  );
});
