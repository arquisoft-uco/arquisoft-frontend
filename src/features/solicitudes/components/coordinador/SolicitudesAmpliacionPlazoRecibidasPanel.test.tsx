import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useSolicitudesAmpliacionPlazoRecibidas } from '../../hooks/useSolicitudesAmpliacionPlazoRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesAmpliacionPlazoRecibidasPanel from './SolicitudesAmpliacionPlazoRecibidasPanel';

vi.mock('../../hooks/useSolicitudesAmpliacionPlazoRecibidas', () => ({
  useSolicitudesAmpliacionPlazoRecibidas: vi.fn(),
}));

type HookRecibidas = ReturnType<typeof useSolicitudesAmpliacionPlazoRecibidas>;

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Necesito dos semanas más para entregar el informe.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-3',
  tipoSolicitudNombre: 'AMPLIACION_DE_PLAZO',
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
  vi.mocked(useSolicitudesAmpliacionPlazoRecibidas).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    pageSize: 10,
    ...parcial,
  } as HookRecibidas);
}

describe('SolicitudesAmpliacionPlazoRecibidasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el esqueleto de carga y no la tabla', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<SolicitudesAmpliacionPlazoRecibidasPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el alert y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockearHook({ isError: true, error: new Error('fallo de red'), refetch });

    // Act
    render(<SolicitudesAmpliacionPlazoRecibidasPanel page={0} onPageChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío propio de la ampliación de plazo cuando no hay solicitudes', () => {
    // Arrange
    mockearHook({ data: crearPagina([]) });

    // Act
    render(<SolicitudesAmpliacionPlazoRecibidasPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no has recibido solicitudes')).toBeInTheDocument();
    expect(
      screen.getByText('Cuando un estudiante solicite una ampliación de plazo, aparecerá aquí.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra remitente, mensaje y fecha, sin botón Responder', () => {
    // Arrange
    mockearHook({ data: crearPagina([SOLICITUD]) });

    // Act
    render(<SolicitudesAmpliacionPlazoRecibidasPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Solicitudes de ampliación de plazo recibidas',
    });
    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText(/luis@uco.edu.co/)).toBeInTheDocument();
    expect(
      within(tabla).getByText('Necesito dos semanas más para entregar el informe.'),
    ).toBeInTheDocument();
    expect(tabla.querySelector('time')).toHaveAttribute('datetime', SOLICITUD.fechaCreacion);
    expect(within(tabla).queryByRole('button')).not.toBeInTheDocument();
  });

  it('con varias páginas el paginador llama a onPageChange con la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    mockearHook({ data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 } });

    // Act
    render(<SolicitudesAmpliacionPlazoRecibidasPanel page={0} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
