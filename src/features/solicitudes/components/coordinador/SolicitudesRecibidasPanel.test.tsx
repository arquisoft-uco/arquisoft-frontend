import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
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
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
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

  it('muestra el esqueleto de carga y no la tabla', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<SolicitudesRecibidasPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el alert con el respaldo y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockearHook({ isError: true, error: new Error('fallo de red'), refetch });

    // Act
    render(<SolicitudesRecibidasPanel />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío cuando no hay solicitudes', () => {
    // Arrange
    mockearHook({ data: crearPagina([]) });

    // Act
    render(<SolicitudesRecibidasPanel />);

    // Assert
    expect(screen.getByText('Aún no has recibido solicitudes')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra el resumen, el remitente y el mensaje en la tabla', () => {
    // Arrange
    mockearHook({ data: crearPagina([SOLICITUD]) });

    // Act
    render(<SolicitudesRecibidasPanel />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Solicitudes de novedad recibidas' });
    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText(/luis@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
  });

  it('con varias páginas el paginador llama a goToPage con la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    mockearHook({
      data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 },
      goToPage,
    });

    // Act
    render(<SolicitudesRecibidasPanel />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });
});
