import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarUsuarios from './ConsultarUsuarios';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
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
});
