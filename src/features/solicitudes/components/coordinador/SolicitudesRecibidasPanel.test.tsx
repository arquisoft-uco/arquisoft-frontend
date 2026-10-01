import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useSolicitudesNovedadCoordinadorRecibidas } from '../../hooks/useSolicitudesNovedadCoordinadorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesRecibidasPanel from './SolicitudesRecibidasPanel';

vi.mock('../../hooks/useSolicitudesNovedadCoordinadorRecibidas', () => ({
  useSolicitudesNovedadCoordinadorRecibidas: vi.fn(),
}));

type HookRecibidas = ReturnType<typeof useSolicitudesNovedadCoordinadorRecibidas>;

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'No he podido contactar a mi asesor.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-1',
  tipoSolicitudNombre: 'NOVEDAD_PARA_EL_COORDINADOR',
  remitente: {
    usuarioId: 'u-1',
    identificador: '2001',
    nombre: 'Luis Gómez',
    email: 'luis@uco.edu.co',
  },
  destinatario: { usuarioId: 'u-2', identificador: '1001', nombre: 'Ana', email: 'ana@uco.edu.co' },
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

function mockearHook(parcial: Partial<HookRecibidas> = {}) {
  vi.mocked(useSolicitudesNovedadCoordinadorRecibidas).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as HookRecibidas);
}

describe('SolicitudesRecibidasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga y no muestra la tabla', () => {
    mockearHook({ isLoading: true });

    render(<SolicitudesRecibidasPanel />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando solicitudes recibidas');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el texto de respaldo en un alert y no muestra la tabla', () => {
    mockearHook({ isError: true, error: new Error('fallo de red') });

    render(<SolicitudesRecibidasPanel />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las solicitudes recibidas.',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el mensaje de vacío cuando no hay solicitudes', () => {
    mockearHook({ data: crearPagina([]) });

    render(<SolicitudesRecibidasPanel />);

    expect(screen.getByText('Aún no has recibido solicitudes de novedad.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el contador, el remitente y el mensaje', () => {
    mockearHook({ data: crearPagina([SOLICITUD]) });

    render(<SolicitudesRecibidasPanel />);

    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.getByText(/luis@uco\.edu\.co/)).toBeInTheDocument();
    expect(screen.getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
  });
});
