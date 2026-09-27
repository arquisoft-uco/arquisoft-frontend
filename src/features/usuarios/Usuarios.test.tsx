import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Usuarios from './Usuarios';
import { Rol } from '../../shared/models/rol';
import { useRegistrarUsuario } from './hooks/useRegistrarUsuario';
import { useCoordinadores } from './hooks/useCoordinadores';
import { useEstudiantes } from './hooks/useEstudiantes';

vi.mock('./hooks/useRegistrarUsuario', () => ({
  useRegistrarUsuario: vi.fn(),
}));

vi.mock('./hooks/useCoordinadores', () => ({
  useCoordinadores: vi.fn(),
}));

vi.mock('./hooks/useEstudiantes', () => ({
  useEstudiantes: vi.fn(),
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
  });

  it('redirige a seleccionar-rol cuando no hay rol activo', () => {
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.queryByRole('heading', { name: 'Coordinadores' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
  });

  it('redirige a forbidden cuando el rol activo no está en el mapa de vistas', () => {
    autenticarCon(Rol.Estudiante);
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.queryByRole('heading', { name: 'Coordinadores' })).not.toBeInTheDocument();
  });

  it('renderiza AdministradorView cuando el rol activo es Administrador', () => {
    autenticarCon(Rol.Administrador);
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.getByRole('heading', { name: 'Coordinadores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
  });
});
