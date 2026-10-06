import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useSolicitudesNovedadCoordinadorEnviadas } from '../../hooks/useSolicitudesNovedadCoordinadorEnviadas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesEnviadasPanel from './SolicitudesEnviadasPanel';

vi.mock('../../hooks/useSolicitudesNovedadCoordinadorEnviadas', () => ({
  useSolicitudesNovedadCoordinadorEnviadas: vi.fn(),
}));

type HookEnviadas = ReturnType<typeof useSolicitudesNovedadCoordinadorEnviadas>;

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'No he podido contactar a mi asesor.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-1',
  tipoSolicitudNombre: 'NOVEDAD_PARA_EL_COORDINADOR',
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

describe('SolicitudesEnviadasPanel', () => {
  beforeEach(() => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReset();
  });

  it('mientras carga muestra el esqueleto y no la tabla', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isLoading: true }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el aviso con «Reintentar», que vuelve a consultar', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red'), refetch }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('sin solicitudes muestra el vacío y no un error', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([]) }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByText('Aún no has enviado solicitudes')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el resumen y la fila con coordinador y mensaje', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    render(<SolicitudesEnviadasPanel />);

    const tabla = screen.getByRole('table', {
      name: 'Solicitudes de novedad enviadas al coordinador',
    });
    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(within(tabla).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(tabla).getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
  });

  it('con varias páginas el paginador pide la siguiente', async () => {
    const user = userEvent.setup();
    const goToPage = vi.fn();
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({
        data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 },
        goToPage,
      }),
    );

    render(<SolicitudesEnviadasPanel />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(goToPage).toHaveBeenCalledWith(1);
  });
});
