import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarUsuarios from './ConsultarUsuarios';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import { useAgregarRol } from '../../hooks/useAgregarRol';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { useEliminarUsuario } from '../../hooks/useEliminarUsuario';
import { toast } from '../../../../shared/hooks/useToast';
import type { Usuario } from '../../models/Usuario';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useUsuarios', () => ({
  useUsuarios: vi.fn(),
}));

// ModificarUsuarioForm (montado condicionalmente por ConsultarUsuarios) importa este hook, que a
// su vez arrastra el service y apiClient hasta config/env.ts. Sin mock, el import de ese módulo
// revienta en test por VITE_API_URL no definida, aunque el formulario nunca llegue a montarse aquí.
vi.mock('../../hooks/useModificarUsuario', () => ({
  useModificarUsuario: vi.fn(),
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
    rolesSeleccionados: [],
    toggleRol: vi.fn(),
    estado: undefined,
    setEstado: vi.fn(),
    vigente: undefined,
    setVigente: vi.fn(),
    ordenCampo: undefined,
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useUsuarios>;
}

describe('ConsultarUsuarios', () => {
  beforeEach(() => {
    vi.mocked(useUsuarios).mockReset();
    vi.mocked(useModificarUsuario).mockReturnValue(crearMutacionModificarMock());
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

  it('muestra el estado de carga con el título visible', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ isLoading: true }));

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios...');
    expect(screen.getByRole('heading', { name: 'Todos los usuarios' })).toBeInTheDocument();
  });

  it('muestra el texto de vacío cuando no hay usuarios', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByText('No hay usuarios que coincidan con el filtro.')).toBeInTheDocument();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los usuarios. Intenta nuevamente.',
    );
  });

  it('deshabilita el botón de actualizar mientras isFetching', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(
      crearHookMock({ data: crearPagina([USUARIO]), isFetching: true }),
    );

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByRole('button', { name: /actualizando/i })).toBeDisabled();
  });

  it('click en Editar de una fila monta ModificarUsuarioForm con el usuario correcto', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
    render(<ConsultarUsuarios />);
    expect(screen.queryByRole('heading', { name: /editar usuario/i })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: `Editar ${USUARIO.nombre}` }));

    // Assert
    expect(
      screen.getByRole('heading', { name: `Editar usuario: ${USUARIO.nombre}` }),
    ).toBeInTheDocument();
  });

  it('cancelar en ModificarUsuarioForm lo desmonta y vuelve a mostrar solo la tabla', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
    render(<ConsultarUsuarios />);
    await user.click(screen.getByRole('button', { name: `Editar ${USUARIO.nombre}` }));
    expect(
      screen.getByRole('heading', { name: `Editar usuario: ${USUARIO.nombre}` }),
    ).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Assert
    expect(screen.queryByRole('heading', { name: /editar usuario/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Editar ${USUARIO.nombre}` })).toBeInTheDocument();
  });

  describe('eliminar usuario', () => {
    async function abrirDialogo() {
      const user = userEvent.setup();
      vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([USUARIO]) }));
      render(<ConsultarUsuarios />);
      await user.click(screen.getByRole('button', { name: `Eliminar ${USUARIO.nombre}` }));
      return user;
    }

    it('abre el diálogo nombrando al usuario y Cancelar lo cierra sin mutar', async () => {
      // Arrange
      const mutate = vi.fn();
      vi.mocked(useEliminarUsuario).mockReturnValue(crearMutacionEliminarMock({ mutate }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Act
      const user = await abrirDialogo();

      // Assert
      expect(screen.getByRole('dialog')).toHaveTextContent(USUARIO.nombre);
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mutate).not.toHaveBeenCalled();
    });

    it('Confirmar muta con el id y, en éxito, lanza toast.success y cierra el diálogo', async () => {
      // Arrange
      const mutate = vi.fn(
        (_id: string, opciones?: { onSuccess?: () => void; onSettled?: () => void }) => {
          opciones?.onSuccess?.();
          opciones?.onSettled?.();
        },
      );
      vi.mocked(useEliminarUsuario).mockReturnValue(
        crearMutacionEliminarMock({ mutate: mutate as never }),
      );
      const user = await abrirDialogo();

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      expect(mutate).toHaveBeenCalledWith(USUARIO.id, expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Usuario eliminado', expect.any(String));
      expect(toast.error).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('en error lanza toast.error con el mensaje de respaldo y cierra el diálogo', async () => {
      // Arrange
      const mutate = vi.fn(
        (_id: string, opciones?: { onError?: (e: unknown) => void; onSettled?: () => void }) => {
          opciones?.onError?.(new Error('fallo'));
          opciones?.onSettled?.();
        },
      );
      vi.mocked(useEliminarUsuario).mockReturnValue(
        crearMutacionEliminarMock({ mutate: mutate as never }),
      );
      const user = await abrirDialogo();

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo eliminar el usuario',
        expect.any(String),
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
      expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });
  });
});
