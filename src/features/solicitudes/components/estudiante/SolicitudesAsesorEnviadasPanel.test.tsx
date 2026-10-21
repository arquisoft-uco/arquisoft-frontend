import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useSolicitudesNovedadAsesorEnviadas } from '../../hooks/useSolicitudesNovedadAsesorEnviadas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesAsesorEnviadasPanel from './SolicitudesAsesorEnviadasPanel';

vi.mock('../../hooks/useSolicitudesNovedadAsesorEnviadas', () => ({
  useSolicitudesNovedadAsesorEnviadas: vi.fn(),
}));

type HookEnviadas = ReturnType<typeof useSolicitudesNovedadAsesorEnviadas>;

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

describe('SolicitudesAsesorEnviadasPanel', () => {
  beforeEach(() => {
    vi.mocked(useSolicitudesNovedadAsesorEnviadas).mockReset();
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

  it('con datos muestra destinatario, mensaje y fecha, sin botones de eliminar', () => {
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
    expect(tabla.querySelector('time')).toHaveAttribute('datetime', SOLICITUD.fechaCreacion);
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
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
});
