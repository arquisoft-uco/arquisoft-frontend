import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Solicitudes from './Solicitudes';
import { Rol } from '../../shared/models/rol';
import { RESPUESTA } from '../../test-utils/respuestas';
import { useEnviarSolicitudNovedadCoordinador } from './hooks/useEnviarSolicitudNovedadCoordinador';
import { useEnviarSolicitudNovedadAsesor } from './hooks/useEnviarSolicitudNovedadAsesor';
import { useSolicitudesNovedadCoordinadorRecibidas } from './hooks/useSolicitudesNovedadCoordinadorRecibidas';
import { useRespuestasNovedadCoordinadorEnviadas } from './hooks/useRespuestasNovedadCoordinadorEnviadas';
import { useRespuestasNovedadCoordinadorRecibidas } from './hooks/useRespuestasNovedadCoordinadorRecibidas';

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

vi.mock('./hooks/useSolicitudesNovedadCoordinadorRecibidas', () => ({
  useSolicitudesNovedadCoordinadorRecibidas: vi.fn(),
}));

vi.mock('./hooks/useRespuestasNovedadCoordinadorEnviadas', () => ({
  useRespuestasNovedadCoordinadorEnviadas: vi.fn(),
}));

vi.mock('./hooks/useRespuestasNovedadCoordinadorRecibidas', () => ({
  useRespuestasNovedadCoordinadorRecibidas: vi.fn(),
}));

vi.mock('./hooks/useResponderSolicitudNovedadCoordinador', () => ({
  useResponderSolicitudNovedadCoordinador: vi.fn(),
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
    expect(screen.queryByText('Esta opción aún no está disponible.')).not.toBeInTheDocument();
  });

  it('muestra ComingSoon cuando el rol activo no tiene vista real de solicitudes', () => {
    autenticarCon(Rol.Administrador);
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
    expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
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
    expect(screen.queryByRole('button', { name: 'Volver al inicio' })).not.toBeInTheDocument();
  });

  it('renderiza CoordinadorView con dos pestañas, arranca en Recibidas y abre Respuestas enviadas', async () => {
    autenticarCon(Rol.Coordinador);
    const pagina = {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    };
    const hookRecibidas: Partial<ReturnType<typeof useSolicitudesNovedadCoordinadorRecibidas>> = {
      data: pagina,
      error: null,
      isLoading: false,
      isError: false,
      isFetching: false,
      isPlaceholderData: false,
      refetch: vi.fn(),
      pageSize: 10,
    };
    const hookRespuestas: Partial<ReturnType<typeof useRespuestasNovedadCoordinadorEnviadas>> = {
      data: pagina,
      error: null,
      isLoading: false,
      isError: false,
      isFetching: false,
      isPlaceholderData: false,
      refetch: vi.fn(),
      pageSize: 10,
    };
    vi.mocked(useSolicitudesNovedadCoordinadorRecibidas).mockReturnValue(
      hookRecibidas as ReturnType<typeof useSolicitudesNovedadCoordinadorRecibidas>,
    );
    vi.mocked(useRespuestasNovedadCoordinadorEnviadas).mockReturnValue(
      hookRespuestas as ReturnType<typeof useRespuestasNovedadCoordinadorEnviadas>,
    );
    const user = userEvent.setup();
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Recibidas',
      'Respuestas enviadas',
    ]);
    expect(screen.getByRole('tab', { name: 'Recibidas' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Aún no has recibido solicitudes')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Respuestas enviadas' }));

    expect(screen.getByText('Aún no has enviado respuestas')).toBeInTheDocument();
    expect(screen.queryByText('Aún no has recibido solicitudes')).not.toBeInTheDocument();
  });

  it('abre Respuestas con su contenido real y conserva la página al ir a otra pestaña y volver', async () => {
    autenticarCon(Rol.Estudiante);
    const hook = vi.mocked(useRespuestasNovedadCoordinadorRecibidas);
    const hookRespuestas: Partial<ReturnType<typeof useRespuestasNovedadCoordinadorRecibidas>> = {
      data: {
        content: [RESPUESTA],
        page: 0,
        size: 10,
        totalElements: 25,
        totalPages: 3,
        first: true,
        last: false,
        empty: false,
      },
      error: null,
      isLoading: false,
      isError: false,
      isFetching: false,
      isPlaceholderData: false,
      refetch: vi.fn(),
      pageSize: 10,
    };
    hook.mockReturnValue(
      hookRespuestas as ReturnType<typeof useRespuestasNovedadCoordinadorRecibidas>,
    );
    const user = userEvent.setup();
    render(<Solicitudes />, { initialPath: '/solicitudes' });

    await user.click(screen.getByRole('tab', { name: 'Respuestas' }));
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades recibidas' });
    expect(within(tabla).getByText('Programemos una reunión.')).toBeInTheDocument();
    expect(screen.queryByText(/próximamente/i)).not.toBeInTheDocument();
    expect(hook).toHaveBeenLastCalledWith(0);

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(hook).toHaveBeenLastCalledWith(1);

    await user.click(screen.getByRole('tab', { name: 'Nueva solicitud' }));
    await user.click(screen.getByRole('tab', { name: 'Respuestas' }));
    expect(hook).toHaveBeenLastCalledWith(1);
  });
});
