import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Usuarios from './Usuarios';
import { Rol } from '../../shared/models/rol';
import { useRegistrarUsuario } from './hooks/useRegistrarUsuario';
import { useCoordinadores } from './hooks/useCoordinadores';
import { useEstudiantes } from './hooks/useEstudiantes';
import { useUsuarios } from './hooks/useUsuarios';

vi.mock('./hooks/useRegistrarUsuario', () => ({
  useRegistrarUsuario: vi.fn(),
}));

vi.mock('./hooks/useCoordinadores', () => ({
  useCoordinadores: vi.fn(),
}));

vi.mock('./hooks/useEstudiantes', () => ({
  useEstudiantes: vi.fn(),
}));

vi.mock('./hooks/useUsuarios', () => ({
  useUsuarios: vi.fn(),
}));

// ModificarUsuarioForm (montado condicionalmente dentro de ConsultarUsuarios) importa este hook,
// que arrastra el service y apiClient hasta config/env.ts. Sin mock, el import revienta en test
// por VITE_API_URL no definida, aunque el formulario nunca llegue a montarse en estos casos.
vi.mock('./hooks/useModificarUsuario', () => ({
  useModificarUsuario: vi.fn(),
}));

function crearCoordinadoresMock(
  parcial: Partial<ReturnType<typeof useCoordinadores>> = {},
): ReturnType<typeof useCoordinadores> {
  return {
    data: {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    },
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useCoordinadores>;
}

function crearEstudiantesMock(
  parcial: Partial<ReturnType<typeof useEstudiantes>> = {},
): ReturnType<typeof useEstudiantes> {
  return {
    data: {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    },
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEstudiantes>;
}

function crearUsuariosMock(
  parcial: Partial<ReturnType<typeof useUsuarios>> = {},
): ReturnType<typeof useUsuarios> {
  return {
    data: {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    },
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

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function crearMutacionMock(
  mutate: ReturnType<typeof vi.fn>,
): ReturnType<typeof useRegistrarUsuario> {
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
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as ReturnType<typeof useRegistrarUsuario>;
}

describe('Usuarios', () => {
  beforeEach(() => {
    resetAllStores();
    vi.mocked(useRegistrarUsuario).mockReturnValue(crearMutacionMock(vi.fn()));
    vi.mocked(useCoordinadores).mockReturnValue(crearCoordinadoresMock());
    vi.mocked(useEstudiantes).mockReturnValue(crearEstudiantesMock());
    vi.mocked(useUsuarios).mockReturnValue(crearUsuariosMock());
  });

  it('redirige a seleccionar-rol cuando no hay rol activo', () => {
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.queryByRole('heading', { name: 'Todos los usuarios' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
  });

  it('redirige a forbidden cuando el rol activo no está en el mapa de vistas', () => {
    autenticarCon(Rol.Estudiante);
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.queryByRole('heading', { name: 'Todos los usuarios' })).not.toBeInTheDocument();
  });

  it('renderiza AdministradorView cuando el rol activo es Administrador', () => {
    autenticarCon(Rol.Administrador);
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.getByRole('heading', { name: 'Todos los usuarios' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
  });
});
