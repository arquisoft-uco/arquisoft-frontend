import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Usuarios from './Usuarios';
import { Rol } from '../../shared/models/rol';
import { useRegistrarUsuario } from './hooks/useRegistrarUsuario';

vi.mock('./hooks/useRegistrarUsuario', () => ({
  useRegistrarUsuario: vi.fn(),
}));

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
  });

  it('redirige a seleccionar-rol cuando no hay rol activo', () => {
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
  });

  it('redirige a forbidden cuando el rol activo no está en el mapa de vistas', () => {
    autenticarCon(Rol.Estudiante);
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('renderiza AdministradorView cuando el rol activo es Administrador', () => {
    autenticarCon(Rol.Administrador);
    render(<Usuarios />, { initialPath: '/usuarios' });

    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
  });
});
