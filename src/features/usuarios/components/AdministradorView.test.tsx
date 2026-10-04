import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import AdministradorView from './AdministradorView';
import { usuariosService } from '../services/usuariosService';
import type { Page } from '../../../shared/models/api-response';
import type { Usuario } from '../models/Usuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    registrarUsuario: vi.fn(),
    consultarUsuariosAdministrador: vi.fn(),
    getEstadosUsuario: vi.fn(),
  },
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const USUARIO: Usuario = {
  id: 'u-1',
  identificador: '2001',
  nombre: 'Marta Ríos',
  email: 'marta@uco.edu.co',
  contacto: '3001234567',
  estado: 'ACTIVO',
  vigente: true,
  esEstudiante: true,
  esAsesor: false,
  esAsesorFicha: false,
  esCoordinador: false,
  esRepresentanteComite: false,
  esAdministrador: false,
  esBibliotecario: false,
};

const USUARIO_NUEVO: Usuario = {
  ...USUARIO,
  id: 'u-2',
  identificador: '1234567890',
  nombre: 'Juan Camilo Pérez Gómez',
  email: 'juan.perez@uco.edu.co',
  esEstudiante: false,
};

function crearPagina(
  content: Usuario[],
  { totalPages = content.length === 0 ? 0 : 1, totalElements = content.length } = {},
): Page<Usuario> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: content.length === 0,
  };
}

// La tabla y la lista de tarjetas están las dos en el DOM (jsdom no aplica CSS): se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Usuarios' }));
}

async function abrirMenuDeFila(user: UserEvent) {
  await user.click(tabla().getByRole('button', { name: `Acciones de ${USUARIO.nombre}` }));
}

describe('AdministradorView', () => {
  beforeEach(() => {
    vi.mocked(usuariosService.consultarUsuariosAdministrador)
      .mockReset()
      .mockResolvedValue(crearPagina([USUARIO]));
    vi.mocked(usuariosService.registrarUsuario).mockReset();
    vi.mocked(usuariosService.getEstadosUsuario)
      .mockReset()
      .mockResolvedValue([{ id: 'ACTIVO', nombre: 'Activo', descripcion: 'Puede operar' }]);
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('monta el listado único con una sola consulta ordenada por nombre y sin pestañas', async () => {
    // Act
    render(<AdministradorView />);
    await screen.findByRole('table', { name: 'Usuarios' });

    // Assert
    expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1);
    expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['nombre:ASC'],
      filtros: undefined,
    });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('"Registrar usuario" abre el panel con el listado detrás y el botón de la cabecera sigue visible', async () => {
    // Arrange
    const user = userEvent.setup();
    const { container } = render(<AdministradorView />);
    await screen.findByRole('table', { name: 'Usuarios' });

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar usuario' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Registrar usuario' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Usuarios' })).toBeInTheDocument();
    expect(
      within(container).getByRole('button', { name: 'Registrar usuario' }),
    ).toBeInTheDocument();
  });

  it('el vacío "Aún no hay usuarios" ofrece "Registrar usuario" y abre el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.consultarUsuariosAdministrador).mockResolvedValue(crearPagina([]));
    render(<AdministradorView />);
    await screen.findByText('Aún no hay usuarios');
    const botones = screen.getAllByRole('button', { name: 'Registrar usuario' });
    expect(botones).toHaveLength(2);

    // Act
    await user.click(botones[1]);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Registrar usuario' })).toBeInTheDocument();
  });

  it('"Editar" abre el panel de edición en Datos y "Cambiar roles" lo abre en Roles', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AdministradorView />);
    await screen.findByRole('table', { name: 'Usuarios' });

    // Act
    await abrirMenuDeFila(user);
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }));

    // Assert
    expect(screen.getByRole('dialog', { name: USUARIO.nombre })).toBeInTheDocument();
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Datos');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    await abrirMenuDeFila(user);
    await user.click(screen.getByRole('menuitem', { name: 'Cambiar roles' }));

    // Assert
    expect(screen.getByRole('dialog', { name: USUARIO.nombre })).toBeInTheDocument();
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Roles');
  });

  it('cerrar el panel devuelve el foco a su disparador y el listado conserva su filtro y su página', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const consultar = vi.mocked(usuariosService.consultarUsuariosAdministrador);
    consultar.mockResolvedValue(crearPagina([USUARIO], { totalPages: 3, totalElements: 21 }));
    render(<AdministradorView />);
    await screen.findByRole('table', { name: 'Usuarios' });
    await user.type(screen.getByLabelText('Buscar usuarios'), 'mar');
    avanzar(300);
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagina: 0, filtros: expect.anything() }),
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 })),
    );
    const consultasAntes = consultar.mock.calls.length;

    // Act
    await abrirMenuDeFila(user);
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tabla().getByRole('button', { name: `Acciones de ${USUARIO.nombre}` })).toHaveFocus();
    expect(screen.getByLabelText('Buscar usuarios')).toHaveValue('mar');
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(consultar).toHaveBeenCalledTimes(consultasAntes);
  });

  it('un registro exitoso cierra el panel y refresca el listado', async () => {
    // Arrange
    const user = userEvent.setup();
    const consultar = vi.mocked(usuariosService.consultarUsuariosAdministrador);
    consultar
      .mockResolvedValueOnce(crearPagina([USUARIO]))
      .mockResolvedValue(crearPagina([USUARIO, USUARIO_NUEVO]));
    vi.mocked(usuariosService.registrarUsuario).mockResolvedValue({ id: USUARIO_NUEVO.id });
    render(<AdministradorView />);
    await screen.findByRole('table', { name: 'Usuarios' });
    await user.click(screen.getByRole('button', { name: 'Registrar usuario' }));
    const panel = within(screen.getByRole('dialog', { name: 'Registrar usuario' }));
    await user.type(panel.getByLabelText('Identificador'), USUARIO_NUEVO.identificador);
    await user.type(panel.getByLabelText('Nombres'), 'Juan Camilo');
    await user.type(panel.getByLabelText('Apellidos'), 'Pérez Gómez');
    await user.type(panel.getByLabelText('Correo electrónico'), USUARIO_NUEVO.email);
    await user.type(panel.getByLabelText('Contacto'), USUARIO_NUEVO.contacto);

    // Act
    await user.click(panel.getByRole('button', { name: 'Registrar usuario' }));

    // Assert
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Registrar usuario' })).not.toBeInTheDocument(),
    );
    expect(
      await tabla().findByRole('button', { name: `Editar ${USUARIO_NUEVO.nombre}` }),
    ).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });
});
