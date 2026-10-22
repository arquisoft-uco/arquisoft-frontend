import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useEliminarSolicitudCambioAsesor } from '../../hooks/useEliminarSolicitudCambioAsesor';
import { useSolicitudesCambioAsesorEnviadas } from '../../hooks/useSolicitudesCambioAsesorEnviadas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesCambioAsesorEnviadasPanel from './SolicitudesCambioAsesorEnviadasPanel';

vi.mock('../../hooks/useSolicitudesCambioAsesorEnviadas', () => ({
  useSolicitudesCambioAsesorEnviadas: vi.fn(),
}));

vi.mock('../../hooks/useEliminarSolicitudCambioAsesor', () => ({
  useEliminarSolicitudCambioAsesor: vi.fn(),
}));

type HookEnviadas = ReturnType<typeof useSolicitudesCambioAsesorEnviadas>;

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Necesito cambiar de asesor.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-3',
  tipoSolicitudNombre: 'CAMBIO_DE_ASESOR',
  remitente: { usuarioId: 'u-1', identificador: '2001', nombre: 'Luis', email: 'luis@uco.edu.co' },
  destinatario: {
    usuarioId: 'u-2',
    identificador: '1001',
    nombre: 'Ana Pérez',
    email: 'ana@uco.edu.co',
  },
};

function crearPagina(content: Solicitud[]): Page<Solicitud> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function crearHookMock(parcial: Partial<HookEnviadas> = {}): HookEnviadas {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as HookEnviadas;
}

type HookEliminar = ReturnType<typeof useEliminarSolicitudCambioAsesor>;

function crearEliminarMock(mutate: HookEliminar['mutate'] = vi.fn()): HookEliminar {
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
  } as HookEliminar;
}

describe('SolicitudesCambioAsesorEnviadasPanel', () => {
  beforeEach(() => {
    vi.mocked(useSolicitudesCambioAsesorEnviadas).mockReset();
    vi.mocked(useEliminarSolicitudCambioAsesor).mockReturnValue(crearEliminarMock());
  });

  it('mientras carga muestra el esqueleto y no la tabla', () => {
    // Arrange
    vi.mocked(useSolicitudesCambioAsesorEnviadas).mockReturnValue(
      crearHookMock({ isLoading: true }),
    );

    // Act
    render(<SolicitudesCambioAsesorEnviadasPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el aviso con «Reintentar», que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useSolicitudesCambioAsesorEnviadas).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red'), refetch }),
    );

    // Act
    render(<SolicitudesCambioAsesorEnviadasPanel />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it('sin solicitudes muestra el vacío del cambio de asesor y no un error', () => {
    // Arrange
    vi.mocked(useSolicitudesCambioAsesorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([]) }),
    );

    // Act
    render(<SolicitudesCambioAsesorEnviadasPanel />);

    // Assert
    expect(screen.getByText('Aún no has enviado solicitudes')).toBeInTheDocument();
    expect(
      screen.getByText('Cuando envíes una solicitud de cambio de asesor, aparecerá aquí.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra destinatario, mensaje, fecha y el botón de eliminar', () => {
    // Arrange
    vi.mocked(useSolicitudesCambioAsesorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    // Act
    render(<SolicitudesCambioAsesorEnviadasPanel />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Solicitudes de cambio de asesor enviadas' });
    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(within(tabla).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(tabla).getByText('Necesito cambiar de asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText(/2026/)).toBeInTheDocument();
    expect(
      within(tabla).getByRole('button', { name: 'Eliminar la solicitud enviada a Ana Pérez' }),
    ).toBeInTheDocument();
  });

  it('al confirmar la eliminación llama la mutación con el id de la solicitud', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn();
    vi.mocked(useEliminarSolicitudCambioAsesor).mockReturnValue(crearEliminarMock(mutate));
    vi.mocked(useSolicitudesCambioAsesorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    // Act
    render(<SolicitudesCambioAsesorEnviadasPanel />);
    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Eliminar la solicitud enviada a Ana Pérez',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('s-1', expect.any(Object));
  });

  it('con varias páginas el paginador pide la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    vi.mocked(useSolicitudesCambioAsesorEnviadas).mockReturnValue(
      crearHookMock({
        data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 },
        goToPage,
      }),
    );

    // Act
    render(<SolicitudesCambioAsesorEnviadasPanel />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });
});
