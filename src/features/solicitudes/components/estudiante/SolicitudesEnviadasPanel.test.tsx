import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
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

  it('muestra el estado de carga y no muestra la tabla', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isLoading: true }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando solicitudes enviadas');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el texto de respaldo en un alert y no muestra la tabla', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las solicitudes enviadas.',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el mensaje de vacío cuando no hay solicitudes', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([]) }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(
      screen.getByText('Aún no has enviado solicitudes de novedad al coordinador.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el contador, el destinatario y el mensaje', () => {
    vi.mocked(useSolicitudesNovedadCoordinadorEnviadas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    render(<SolicitudesEnviadasPanel />);

    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText(/ana@uco\.edu\.co/)).toBeInTheDocument();
    expect(screen.getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
  });
});
