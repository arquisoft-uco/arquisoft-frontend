import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Solicitudes from './Solicitudes';
import { Rol } from '../../shared/models/rol';
import { useEnviarSolicitudNovedadCoordinador } from './hooks/useEnviarSolicitudNovedadCoordinador';

vi.mock('./hooks/useEnviarSolicitudNovedadCoordinador', () => ({
  useEnviarSolicitudNovedadCoordinador: vi.fn(),
}));

type MutacionEnviarSolicitud = ReturnType<typeof useEnviarSolicitudNovedadCoordinador>;

function crearMutacionMock(): MutacionEnviarSolicitud {
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
  } as MutacionEnviarSolicitud;
}

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('Solicitudes', () => {
  beforeEach(() => {
    resetAllStores();
    vi.mocked(useEnviarSolicitudNovedadCoordinador).mockReturnValue(crearMutacionMock());
  });

  it('redirige a seleccionar-rol cuando no hay rol activo', () => {
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(
      screen.queryByRole('heading', { name: 'Enviar solicitud de novedad al coordinador' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('En construcción')).not.toBeInTheDocument();
  });

  it('muestra ComingSoon cuando el rol activo no tiene vista real de HU-081', () => {
    autenticarCon(Rol.Administrador);
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
    expect(screen.getByText('En construcción')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Enviar solicitud de novedad al coordinador/i }),
    ).not.toBeInTheDocument();
  });

  it('renderiza EstudianteView con el formulario real cuando el rol activo es Estudiante', () => {
    autenticarCon(Rol.Estudiante);
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Enviar solicitud de novedad al coordinador/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('En construcción')).not.toBeInTheDocument();
  });
});
