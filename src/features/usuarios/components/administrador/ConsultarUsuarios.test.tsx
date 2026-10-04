import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { QueryClient, type MutationFunctionContext } from '@tanstack/react-query';
import { render, screen, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import ConsultarUsuarios from './ConsultarUsuarios';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import { useCambiarEstadoUsuario } from '../../hooks/useCambiarEstadoUsuario';
import { useAgregarRol } from '../../hooks/useAgregarRol';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { useEliminarUsuario } from '../../hooks/useEliminarUsuario';
import { toast } from '../../../../shared/hooks/useToast';
import { Rol } from '../../../../shared/models/rol';
import type { Usuario } from '../../models/Usuario';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useUsuarios', () => ({
  useUsuarios: vi.fn(),
}));

// ModificarUsuarioForm (montado condicionalmente por ConsultarUsuarios) importa este hook, que a
// su vez arrastra el service y apiClient hasta config/env.ts. Sin mock, el import de ese módulo
// revienta en test por VITE_API_URL no definida, aunque el formulario nunca llegue a montarse aquí.
vi.mock('../../hooks/useEstadosUsuario', () => ({
  useEstadosUsuario: vi.fn(),
}));

vi.mock('../../hooks/useModificarUsuario', () => ({
  useModificarUsuario: vi.fn(),
}));

vi.mock('../../hooks/useCambiarEstadoUsuario', () => ({
  useCambiarEstadoUsuario: vi.fn(),
}));

vi.mock('../../hooks/useAgregarRol', () => ({
  useAgregarRol: vi.fn(),
}));

vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
}));

vi.mock('../../hooks/useEliminarUsuario', () => ({
  useEliminarUsuario: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Mutar = ReturnType<typeof useEliminarUsuario>['mutate'];

const CONTEXTO_DE_MUTACION: MutationFunctionContext = {
  client: new QueryClient(),
  meta: undefined,
};

const ESTADOS = [
  { id: 'ACTIVO', nombre: 'Activo', descripcion: 'Puede operar' },
  { id: 'INACTIVO', nombre: 'Inactivo', descripcion: 'Sin acceso' },
];

function crearEstadosMock(
  parcial: Partial<ReturnType<typeof useEstadosUsuario>> = {},
): ReturnType<typeof useEstadosUsuario> {
  return {
    data: ESTADOS,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useEstadosUsuario>;
}

function crearMutacionEliminarMock(
  parcial: Partial<ReturnType<typeof useEliminarUsuario>> = {},
): ReturnType<typeof useEliminarUsuario> {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEliminarUsuario>;
}

function crearMutacionAgregarMock<T = ReturnType<typeof useAgregarRol>>(): T {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as T;
}

function crearMutacionModificarMock(): ReturnType<typeof useModificarUsuario> {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as ReturnType<typeof useModificarUsuario>;
}

function crearMutacionCambiarEstadoMock(): ReturnType<typeof useCambiarEstadoUsuario> {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as ReturnType<typeof useCambiarEstadoUsuario>;
}

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

const USUARIO_DADO_DE_BAJA: Usuario = {
  ...USUARIO,
  id: 'u-2',
  identificador: '2002',
  nombre: 'Luis Pardo',
  email: 'luis@uco.edu.co',
  contacto: '3007654321',
  vigente: false,
  esEstudiante: false,
};

function crearPagina(
  content: Usuario[],
  { totalPages = 1, totalElements = content.length } = {},
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

function crearHookMock(
  parcial: Partial<ReturnType<typeof useUsuarios>> = {},
): ReturnType<typeof useUsuarios> {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    texto: '',
    setTexto: vi.fn(),
    rolesSeleccionados: [],
    toggleRol: vi.fn(),
    limpiarRoles: vi.fn(),
    estado: undefined,
    setEstado: vi.fn(),
    vigente: undefined,
    setVigente: vi.fn(),
    ordenCampo: 'nombre',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useUsuarios>;
}

function renderizar(onRegistrar = vi.fn()) {
  return render(<ConsultarUsuarios onRegistrar={onRegistrar} />);
}

// La tabla y la lista de tarjetas están las dos en el DOM (jsdom no aplica CSS): se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Usuarios' }));
}

async function abrirSeccionEstado(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: /^filtros/i }));
  return within(screen.getByRole('group', { name: 'Estado' }));
}

describe('ConsultarUsuarios', () => {
  beforeEach(() => {
    vi.mocked(useUsuarios).mockReset();
    vi.mocked(useEstadosUsuario).mockReturnValue(crearEstadosMock());
    vi.mocked(useModificarUsuario).mockReturnValue(crearMutacionModificarMock());
    vi.mocked(useCambiarEstadoUsuario).mockReturnValue(crearMutacionCambiarEstadoMock());
    vi.mocked(useAgregarRol).mockReturnValue(crearMutacionAgregarMock());
    vi.mocked(useRemoverRol).mockReturnValue({
      objetivo: null,
      solicitar: vi.fn(),
      cancelar: vi.fn(),
      confirmar: vi.fn(),
      isPending: false,
    });
    vi.mocked(useEliminarUsuario).mockReturnValue(crearMutacionEliminarMock());
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('muestra el esqueleto de carga mientras llega la primera página', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ isLoading: true }));

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios…');
    expect(screen.queryByRole('table', { name: 'Usuarios' })).not.toBeInTheDocument();
  });

  it('muestra el esqueleto y no "Aún no hay usuarios" mientras llegan los datos tras quitar los filtros', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(
      crearHookMock({ data: crearPagina([]), isPlaceholderData: true, isFetching: true }),
    );

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios…');
    expect(screen.queryByText('Aún no hay usuarios')).not.toBeInTheDocument();
  });

  it('muestra "Aún no hay usuarios" y su acción registra cuando no hay datos ni filtros', async () => {
    // Arrange
    const user = userEvent.setup();
    const onRegistrar = vi.fn();
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([]) }));
    renderizar(onRegistrar);

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar usuario' }));

    // Assert
    expect(screen.getByText('Aún no hay usuarios')).toBeInTheDocument();
    expect(onRegistrar).toHaveBeenCalledTimes(1);
  });

  it('muestra un aviso con role="alert" y "Reintentar" vuelve a consultar cuando la consulta falla', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useUsuarios).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red'), refetch }),
    );
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los usuarios');
    expect(screen.queryByRole('table', { name: 'Usuarios' })).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('"Editar" desde el nombre y desde el menú de fila monta ModificarUsuarioForm con el usuario correcto', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
    renderizar();
    expect(screen.queryByRole('heading', { name: /editar usuario/i })).not.toBeInTheDocument();

    // Act
    await user.click(tabla().getByRole('button', { name: `Editar ${USUARIO.nombre}` }));

    // Assert
    expect(
      screen.getByRole('heading', { name: `Editar usuario: ${USUARIO.nombre}` }),
    ).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    await user.click(tabla().getByRole('button', { name: `Acciones de ${USUARIO.nombre}` }));
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }));

    // Assert
    expect(
      screen.getByRole('heading', { name: `Editar usuario: ${USUARIO.nombre}` }),
    ).toBeInTheDocument();
  });

  it('cancelar en ModificarUsuarioForm lo desmonta y vuelve a mostrar solo el listado', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
    renderizar();
    await user.click(tabla().getByRole('button', { name: `Editar ${USUARIO.nombre}` }));
    expect(
      screen.getByRole('heading', { name: `Editar usuario: ${USUARIO.nombre}` }),
    ).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Assert
    expect(screen.queryByRole('heading', { name: /editar usuario/i })).not.toBeInTheDocument();
    expect(tabla().getByRole('button', { name: `Editar ${USUARIO.nombre}` })).toBeInTheDocument();
  });

  describe('catálogo de estados', () => {
    it('lista las opciones por nombre y filtra enviando el id', async () => {
      // Arrange
      const user = userEvent.setup();
      const setEstado = vi.fn();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({ data: crearPagina([USUARIO]), setEstado }),
      );
      renderizar();
      const estado = await abrirSeccionEstado(user);

      // Act
      await user.click(estado.getByRole('button', { name: 'Inactivo' }));

      // Assert
      expect(estado.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
      expect(estado.getByRole('button', { name: 'Activo' })).toBeInTheDocument();
      expect(setEstado).toHaveBeenCalledWith('INACTIVO');
      expect(tabla().getByText('Activo')).toBeInTheDocument();
    });

    it('deshabilita las opciones con aviso si el catálogo falla y deja el id crudo en la tabla', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(useEstadosUsuario).mockReturnValue(
        crearEstadosMock({ data: undefined, isError: true }),
      );
      vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
      renderizar();

      // Act
      const estado = await abrirSeccionEstado(user);

      // Assert
      expect(estado.getByRole('button', { name: 'Todos' })).toBeDisabled();
      expect(
        screen.getByRole('note', { name: 'No disponible: estados de usuario' }),
      ).toBeInTheDocument();
      expect(tabla().getByText('ACTIVO')).toBeInTheDocument();
    });

    it('deshabilita la sección y deja solo "Todos" mientras llega el catálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(useEstadosUsuario).mockReturnValue(
        crearEstadosMock({ data: undefined, isLoading: true }),
      );
      vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
      renderizar();

      // Act
      const estado = await abrirSeccionEstado(user);

      // Assert
      expect(estado.getAllByRole('button')).toHaveLength(1);
      expect(estado.getByRole('button', { name: 'Todos' })).toBeDisabled();
    });
  });

  describe('dar de baja', () => {
    async function abrirDialogo() {
      const user = userEvent.setup();
      vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
      renderizar();
      await user.click(tabla().getByRole('button', { name: `Acciones de ${USUARIO.nombre}` }));
      await user.click(screen.getByRole('menuitem', { name: 'Dar de baja…' }));
      return user;
    }

    it('abre el diálogo nombrando al usuario y Cancelar lo cierra sin mutar', async () => {
      // Arrange
      const mutate = vi.fn();
      vi.mocked(useEliminarUsuario).mockReturnValue(crearMutacionEliminarMock({ mutate }));

      // Act
      const user = await abrirDialogo();

      // Assert
      expect(
        screen.getByRole('dialog', { name: `¿Dar de baja a ${USUARIO.nombre}?` }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Solo se puede dar de baja a quien ya no tiene roles vigentes\./),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mutate).not.toHaveBeenCalled();
    });

    it('Confirmar muta con el id y, en éxito, lanza toast.success y cierra el diálogo', async () => {
      // Arrange
      const mutate = vi.fn<Mutar>((id, opciones) => {
        opciones?.onSuccess?.(undefined, id, undefined, CONTEXTO_DE_MUTACION);
        opciones?.onSettled?.(undefined, null, id, undefined, CONTEXTO_DE_MUTACION);
      });
      vi.mocked(useEliminarUsuario).mockReturnValue(crearMutacionEliminarMock({ mutate }));
      const user = await abrirDialogo();

      // Act
      await user.click(screen.getByRole('button', { name: 'Dar de baja' }));

      // Assert
      expect(mutate).toHaveBeenCalledWith(USUARIO.id, expect.any(Object));
      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(
        'Usuario dado de baja',
        `${USUARIO.nombre} ya no está vigente.`,
      );
      expect(toast.error).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('en error lanza toast.error con el mensaje de respaldo y cierra el diálogo', async () => {
      // Arrange
      const mutate = vi.fn<Mutar>((id, opciones) => {
        const error = new Error('fallo');
        opciones?.onError?.(error, id, undefined, CONTEXTO_DE_MUTACION);
        opciones?.onSettled?.(undefined, error, id, undefined, CONTEXTO_DE_MUTACION);
      });
      vi.mocked(useEliminarUsuario).mockReturnValue(crearMutacionEliminarMock({ mutate }));
      const user = await abrirDialogo();

      // Act
      await user.click(screen.getByRole('button', { name: 'Dar de baja' }));

      // Assert
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo dar de baja al usuario',
        'Inténtalo nuevamente.',
      );
      expect(toast.success).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('con la mutación pendiente bloquea Confirmar y Cancelar y no cierra el diálogo', async () => {
      // Arrange
      vi.mocked(useEliminarUsuario).mockReturnValue(
        crearMutacionEliminarMock({ isPending: true, status: 'pending', isIdle: false }),
      );

      // Act
      await abrirDialogo();

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });
  });

  describe('búsqueda, chips y orden', () => {
    it('el texto espera 300 ms con temporizadores falsos y entonces llama a setTexto', async () => {
      // Arrange
      const user = usarTemporizadoresFalsos();
      const setTexto = vi.fn();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({ data: crearPagina([USUARIO]), setTexto }),
      );
      renderizar();

      // Act
      await user.type(screen.getByRole('textbox', { name: 'Buscar usuarios' }), 'ana');
      avanzar(299);

      // Assert
      expect(setTexto).not.toHaveBeenCalled();

      // Act
      avanzar(1);

      // Assert
      expect(setTexto).toHaveBeenCalledTimes(1);
      expect(setTexto).toHaveBeenCalledWith('ana');
    });

    it('los chips son "Todos" y los seis roles, reflejan la selección y llaman a toggleRol y limpiarRoles', async () => {
      // Arrange
      const user = userEvent.setup();
      const toggleRol = vi.fn();
      const limpiarRoles = vi.fn();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({
          data: crearPagina([USUARIO]),
          rolesSeleccionados: [Rol.Estudiante],
          toggleRol,
          limpiarRoles,
        }),
      );
      renderizar();
      const roles = within(screen.getByRole('group', { name: 'Filtrar por rol' }));

      // Assert
      expect(roles.getAllByRole('button').map((chip) => chip.textContent)).toEqual([
        'Todos',
        'Estudiantes',
        'Asesores',
        'Asesores de ficha',
        'Coordinadores',
        'Comité',
        'Administradores',
      ]);
      expect(roles.getByRole('button', { name: 'Estudiantes' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(roles.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');

      // Act
      await user.click(roles.getByRole('button', { name: 'Asesores de ficha' }));
      await user.click(roles.getByRole('button', { name: 'Todos' }));

      // Assert
      expect(toggleRol).toHaveBeenCalledTimes(1);
      expect(toggleRol).toHaveBeenCalledWith(Rol.AsesorFicha);
      expect(limpiarRoles).toHaveBeenCalledTimes(1);
    });

    it('ordena desde la cabecera de la tabla y desde "Ordenar por" del panel', async () => {
      // Arrange
      const user = userEvent.setup();
      const setOrden = vi.fn();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({ data: crearPagina([USUARIO]), setOrden }),
      );
      const { rerender } = renderizar();
      const usuario = tabla().getByRole('columnheader', { name: 'Usuario' });
      const identificador = tabla().getByRole('columnheader', { name: 'Identificador' });

      // Assert
      expect(usuario).toHaveAttribute('aria-sort', 'ascending');
      expect(identificador).toHaveAttribute('aria-sort', 'none');
      expect(tabla().getByRole('columnheader', { name: 'Contacto' })).not.toHaveAttribute(
        'aria-sort',
      );

      // Act
      await user.click(within(identificador).getByRole('button', { name: 'Identificador' }));
      await user.click(within(usuario).getByRole('button', { name: 'Usuario' }));

      // Assert
      expect(setOrden).toHaveBeenNthCalledWith(1, 'identificador', 'ASC');
      expect(setOrden).toHaveBeenNthCalledWith(2, 'nombre', 'DESC');

      // Act
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({
          data: crearPagina([USUARIO]),
          setOrden,
          ordenCampo: 'identificador',
          ordenDireccion: 'DESC',
        }),
      );
      rerender(<ConsultarUsuarios onRegistrar={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: /^filtros/i }));
      const ordenarPor = within(screen.getByRole('group', { name: 'Ordenar por' }));

      // Assert
      expect(identificador).toHaveAttribute('aria-sort', 'descending');
      expect(
        ordenarPor.getByRole('button', { name: 'Identificador (descendente)' }),
      ).toHaveAttribute('aria-pressed', 'true');

      // Act
      await user.click(ordenarPor.getByRole('button', { name: 'Nombre (Z-A)' }));

      // Assert
      expect(setOrden).toHaveBeenNthCalledWith(3, 'nombre', 'DESC');
    });
  });

  describe('filtros del panel y filtros aplicados', () => {
    it('"Vigencia" del panel traduce "Vigentes", "Dados de baja" y "Todos" a true, false y sin filtro', async () => {
      // Arrange
      const user = userEvent.setup();
      const setVigente = vi.fn();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({ data: crearPagina([USUARIO]), setVigente }),
      );
      renderizar();
      await user.click(screen.getByRole('button', { name: /^filtros/i }));
      const vigencia = within(screen.getByRole('group', { name: 'Vigencia' }));

      // Act
      await user.click(vigencia.getByRole('button', { name: 'Vigentes' }));
      await user.click(vigencia.getByRole('button', { name: 'Dados de baja' }));
      await user.click(vigencia.getByRole('button', { name: 'Todos' }));

      // Assert
      expect(setVigente).toHaveBeenNthCalledWith(1, true);
      expect(setVigente).toHaveBeenNthCalledWith(2, false);
      expect(setVigente).toHaveBeenNthCalledWith(3, undefined);
    });

    it('los filtros aplicados se quitan con su ✕ y "Limpiar todo" llama a limpiarFiltros', async () => {
      // Arrange
      const user = userEvent.setup();
      const setEstado = vi.fn();
      const setVigente = vi.fn();
      const limpiarFiltros = vi.fn();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({
          data: crearPagina([USUARIO]),
          estado: 'INACTIVO',
          vigente: true,
          setEstado,
          setVigente,
          limpiarFiltros,
        }),
      );
      renderizar();

      // Assert
      expect(screen.getByText('Filtros aplicados:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filtros 2' })).toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('button', { name: 'Quitar filtro Estado: Inactivo' }));
      await user.click(screen.getByRole('button', { name: 'Quitar filtro Vigencia: Vigentes' }));
      await user.click(screen.getByRole('button', { name: 'Limpiar todo' }));

      // Assert
      expect(setEstado).toHaveBeenCalledWith(undefined);
      expect(setVigente).toHaveBeenCalledWith(undefined);
      expect(limpiarFiltros).toHaveBeenCalledTimes(1);
    });

    it('"Sin resultados" ofrece "Limpiar filtros", que llama a limpiarFiltros', async () => {
      // Arrange
      const user = userEvent.setup();
      const limpiarFiltros = vi.fn();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({ data: crearPagina([]), texto: 'zzz', limpiarFiltros }),
      );
      renderizar();

      // Act
      await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

      // Assert
      expect(screen.getByText('Sin resultados')).toBeInTheDocument();
      expect(screen.queryByText('Aún no hay usuarios')).not.toBeInTheDocument();
      expect(screen.queryByRole('table', { name: 'Usuarios' })).not.toBeInTheDocument();
      expect(limpiarFiltros).toHaveBeenCalledTimes(1);
    });
  });

  describe('filas del listado', () => {
    const fila = (nombre: string) => within(tabla().getByRole('row', { name: new RegExp(nombre) }));

    it('muestra hasta dos insignias de rol y un "+N", al bibliotecario, "Sin roles" y "Dado de baja"', () => {
      // Arrange
      const variosRoles: Usuario = {
        ...USUARIO,
        id: 'u-3',
        identificador: '2003',
        nombre: 'Ana Gómez',
        email: 'ana@uco.edu.co',
        esAsesor: true,
        esCoordinador: true,
      };
      const bibliotecario: Usuario = {
        ...USUARIO,
        id: 'u-4',
        identificador: '2004',
        nombre: 'Pedro Soto',
        email: 'pedro@uco.edu.co',
        esEstudiante: false,
        esBibliotecario: true,
      };
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({
          data: crearPagina([variosRoles, bibliotecario, USUARIO_DADO_DE_BAJA]),
        }),
      );

      // Act
      renderizar();

      // Assert
      expect(screen.getByText('3 usuarios')).toBeInTheDocument();
      expect(fila('Ana Gómez').getByText('Estudiante')).toBeInTheDocument();
      expect(fila('Ana Gómez').getByText('Asesor')).toBeInTheDocument();
      expect(fila('Ana Gómez').getByText('+1')).toBeInTheDocument();
      expect(fila('Ana Gómez').getByTitle('Coordinador')).toBeInTheDocument();
      expect(fila('Ana Gómez').queryByText('Sin roles')).not.toBeInTheDocument();
      expect(fila('Pedro Soto').getByText('Bibliotecario')).toBeInTheDocument();
      expect(fila('Pedro Soto').queryByText('Sin roles')).not.toBeInTheDocument();
      expect(fila('Luis Pardo').getByText('Sin roles')).toBeInTheDocument();
      expect(fila('Luis Pardo').getByText('Dado de baja')).toBeInTheDocument();
      expect(fila('Ana Gómez').getByText('Activo')).toBeInTheDocument();
    });

    it('"Cambiar roles" abre el formulario del usuario de esa fila y "Dar de baja…" se deshabilita si ya no está vigente', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(useUsuarios).mockReturnValue(
        crearHookMock({ data: crearPagina([USUARIO, USUARIO_DADO_DE_BAJA]) }),
      );
      renderizar();
      const nombreDadoDeBaja = USUARIO_DADO_DE_BAJA.nombre;

      // Act
      await user.click(tabla().getByRole('button', { name: `Acciones de ${nombreDadoDeBaja}` }));

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Dar de baja…' })).toBeDisabled();

      // Act
      await user.click(screen.getByRole('menuitem', { name: 'Cambiar roles' }));

      // Assert
      expect(
        screen.getByRole('heading', { name: `Editar usuario: ${nombreDadoDeBaja}` }),
      ).toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      await user.click(tabla().getByRole('button', { name: `Acciones de ${USUARIO.nombre}` }));

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Dar de baja…' })).toBeEnabled();
    });
  });
});
