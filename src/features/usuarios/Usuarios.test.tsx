import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Usuarios from './Usuarios';
import { Rol } from '../../shared/models/rol';
import { useRegistrarUsuario } from './hooks/useRegistrarUsuario';
import { useUsuarios } from './hooks/useUsuarios';
import { useRemoverRol } from './hooks/useRemoverRol';
import type { Usuario } from './models/Usuario';

vi.mock('./hooks/useEstadosUsuario', () => ({
  useEstadosUsuario: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock('./hooks/useRegistrarUsuario', () => ({
  useRegistrarUsuario: vi.fn(),
}));

vi.mock('./hooks/useUsuarios', () => ({
  useUsuarios: vi.fn(),
}));

// EditarUsuarioPanel (montado condicionalmente dentro de AdministradorView) importa este hook,
// que arrastra el service y apiClient hasta config/env.ts. Sin mock, el import revienta en test
// por VITE_API_URL no definida, aunque el panel nunca llegue a montarse en estos casos.
vi.mock('./hooks/useModificarUsuario', () => ({
  useModificarUsuario: vi.fn(),
}));

vi.mock('./hooks/useCambiarEstadoUsuario', () => ({
  useCambiarEstadoUsuario: vi.fn(),
}));

vi.mock('./hooks/useAgregarRol', () => ({
  useAgregarRol: vi.fn(),
}));

vi.mock('./hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
}));

vi.mock('./hooks/useEliminarUsuario', () => ({
  useEliminarUsuario: vi.fn(),
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

// Una fila en la respuesta: sin ella el vacío agrega un segundo «Registrar usuario».
function crearUsuariosMock(
  parcial: Partial<ReturnType<typeof useUsuarios>> = {},
): ReturnType<typeof useUsuarios> {
  return {
    data: {
      content: [USUARIO],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      empty: false,
    },
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
    vi.mocked(useUsuarios).mockReturnValue(crearUsuariosMock());
    vi.mocked(useRemoverRol).mockReturnValue({
      objetivo: null,
      solicitar: vi.fn(),
      cancelar: vi.fn(),
      confirmar: vi.fn(),
      isPending: false,
    });
  });

  it('redirige a seleccionar-rol cuando no hay rol activo', () => {
    // Act
    render(<Usuarios />, { initialPath: '/usuarios' });

    // Assert
    expect(screen.queryByRole('heading', { name: 'Usuarios' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
  });

  it('redirige a forbidden cuando el rol activo no está en el mapa de vistas', () => {
    // Arrange
    autenticarCon(Rol.Estudiante);

    // Act
    render(<Usuarios />, { initialPath: '/usuarios' });

    // Assert
    expect(screen.queryByRole('heading', { name: 'Usuarios' })).not.toBeInTheDocument();
  });

  it('renderiza AdministradorView cuando el rol activo es Administrador', () => {
    // Arrange
    autenticarCon(Rol.Administrador);

    // Act
    render(<Usuarios />, { initialPath: '/usuarios' });

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
  });
});
