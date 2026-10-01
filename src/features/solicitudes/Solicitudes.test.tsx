import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Solicitudes from './Solicitudes';
import { Rol } from '../../shared/models/rol';
import { useEnviarSolicitudNovedadCoordinador } from './hooks/useEnviarSolicitudNovedadCoordinador';
import { useEnviarSolicitudNovedadAsesor } from './hooks/useEnviarSolicitudNovedadAsesor';

vi.mock('./hooks/useEnviarSolicitudNovedadCoordinador', () => ({
  useEnviarSolicitudNovedadCoordinador: vi.fn(),
}));

vi.mock('./hooks/useEnviarSolicitudNovedadAsesor', () => ({
  useEnviarSolicitudNovedadAsesor: vi.fn(),
}));

vi.mock('./hooks/useSolicitudesNovedadCoordinadorEnviadas', () => ({
  useSolicitudesNovedadCoordinadorEnviadas: vi.fn(),
}));

vi.mock('./hooks/useEliminarSolicitudNovedadCoordinador', () => ({
  useEliminarSolicitudNovedadCoordinador: vi.fn(),
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
    vi.mocked(useEnviarSolicitudNovedadAsesor).mockReturnValue(crearMutacionMock());
  });

  it('redirige a seleccionar-rol cuando no hay rol activo', () => {
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(
      screen.queryByRole('heading', { name: 'Enviar solicitud de novedad al coordinador' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('En construcción')).not.toBeInTheDocument();
  });

  it('muestra ComingSoon cuando el rol activo no tiene vista real de solicitudes', () => {
    autenticarCon(Rol.Administrador);
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
    expect(screen.getByText('En construcción')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Enviar solicitud de novedad al coordinador/i }),
    ).not.toBeInTheDocument();
  });

  it('renderiza EstudianteView con tres pestañas y el formulario de coordinador cuando el rol activo es Estudiante', () => {
    autenticarCon(Rol.Estudiante);
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Nueva solicitud',
      'Enviadas',
      'Respuestas',
    ]);
    expect(screen.getByRole('tab', { name: 'Nueva solicitud' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('heading', { name: /Enviar solicitud de novedad al coordinador/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('En construcción')).not.toBeInTheDocument();
  });

  it('muestra el aviso de próximamente al abrir Respuestas', async () => {
    autenticarCon(Rol.Estudiante);
    const user = userEvent.setup();
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    await user.click(screen.getByRole('tab', { name: 'Respuestas' }));
    expect(screen.getByRole('status')).toHaveTextContent(/próximamente/i);
  });
});
