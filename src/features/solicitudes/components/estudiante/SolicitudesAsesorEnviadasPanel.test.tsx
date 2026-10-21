import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useEliminarSolicitudNovedadAsesor } from '../../hooks/useEliminarSolicitudNovedadAsesor';
import { useSolicitudesNovedadAsesorEnviadas } from '../../hooks/useSolicitudesNovedadAsesorEnviadas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesAsesorEnviadasPanel from './SolicitudesAsesorEnviadasPanel';

vi.mock('../../hooks/useSolicitudesNovedadAsesorEnviadas', () => ({
  useSolicitudesNovedadAsesorEnviadas: vi.fn(),
}));

vi.mock('../../hooks/useEliminarSolicitudNovedadAsesor', () => ({
  useEliminarSolicitudNovedadAsesor: vi.fn(),
}));

type HookEnviadas = ReturnType<typeof useSolicitudesNovedadAsesorEnviadas>;
type HookEliminar = ReturnType<typeof useEliminarSolicitudNovedadAsesor>;

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Mi asesor no responde.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-2',
  tipoSolicitudNombre: 'NOVEDAD_PARA_EL_ASESOR',
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

function mockearEliminar(mutate = vi.fn()) {
  vi.mocked(useEliminarSolicitudNovedadAsesor).mockReturnValue({
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
  } as HookEliminar);
  return mutate;
}

describe('SolicitudesAsesorEnviadasPanel', () => {
  beforeEach(() => {
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReset();
    mockearEliminar();
  });

  it('mientras carga muestra el esqueleto y no la tabla', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReturnValue(
      crearHookMock({ isLoading: true }),
    );

    // Act
    render(<SolicitudesAsesorEnviadasPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el aviso con «Reintentar», que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red'), refetch }),
    );

    // Act
    render(<SolicitudesAsesorEnviadasPanel />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it('sin solicitudes muestra el vacío del asesor y no un error', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([]) }),
    );

    // Act
    render(<SolicitudesAsesorEnviadasPanel />);

    // Assert
    expect(screen.getByText('Aún no has enviado solicitudes')).toBeInTheDocument();
    expect(
      screen.getByText('Cuando envíes una novedad al asesor, aparecerá aquí.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra destinatario, mensaje y fecha, y el botón de eliminar', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    // Act
    render(<SolicitudesAsesorEnviadasPanel />);

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Solicitudes de novedad enviadas al asesor',
    });
    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(within(tabla).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(tabla).getByText('Mi asesor no responde.')).toBeInTheDocument();
    expect(within(tabla).getByText(/2026/)).toBeInTheDocument();
    expect(
      within(tabla).getByRole('button', { name: 'Eliminar la solicitud enviada a Ana Pérez' }),
    ).toBeInTheDocument();
  });

  it('con varias páginas el paginador pide la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReturnValue(
      crearHookMock({
        data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 },
        goToPage,
      }),
    );

    // Act
    render(<SolicitudesAsesorEnviadasPanel />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('al confirmar la eliminación llama la mutación del asesor con el id', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearEliminar();
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );
    render(<SolicitudesAsesorEnviadasPanel />);

    // Act
    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Eliminar la solicitud enviada a Ana Pérez',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('s-1', expect.any(Object));
  });
});
