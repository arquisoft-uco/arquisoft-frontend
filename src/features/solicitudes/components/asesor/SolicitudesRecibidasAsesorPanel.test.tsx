import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useResponderSolicitudNovedadAsesor } from '../../hooks/useResponderSolicitudNovedadAsesor';
import { useSolicitudesNovedadAsesorRecibidas } from '../../hooks/useSolicitudesNovedadAsesorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesRecibidasAsesorPanel from './SolicitudesRecibidasAsesorPanel';

vi.mock('../../hooks/useSolicitudesNovedadAsesorRecibidas', () => ({
  useSolicitudesNovedadAsesorRecibidas: vi.fn(),
}));

vi.mock('../../hooks/useResponderSolicitudNovedadAsesor', () => ({
  useResponderSolicitudNovedadAsesor: vi.fn(),
}));

type HookRecibidas = ReturnType<typeof useSolicitudesNovedadAsesorRecibidas>;

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Mi asesor no responde.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-2',
  tipoSolicitudNombre: 'NOVEDAD_PARA_EL_ASESOR',
  remitente: {
    usuarioId: 'u-1',
    identificador: '2001',
    nombre: 'Luis Gómez',
    email: 'luis@uco.edu.co',
  },
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

function crearHookMock(parcial: Partial<HookRecibidas> = {}): HookRecibidas {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    pageSize: 10,
    ...parcial,
  } as HookRecibidas;
}

function mockearResponder(mutate = vi.fn()) {
  vi.mocked(useResponderSolicitudNovedadAsesor).mockReturnValue({
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
  } as ReturnType<typeof useResponderSolicitudNovedadAsesor>);
  return mutate;
}

describe('SolicitudesRecibidasAsesorPanel', () => {
  beforeEach(() => {
    vi.mocked(useSolicitudesNovedadAsesorRecibidas).mockReset();
    mockearResponder();
  });

  it('mientras carga muestra el esqueleto y no la tabla', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadAsesorRecibidas).mockReturnValue(
      crearHookMock({ isLoading: true }),
    );

    // Act
    render(<SolicitudesRecibidasAsesorPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ante un error muestra el aviso con «Reintentar», que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useSolicitudesNovedadAsesorRecibidas).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red'), refetch }),
    );

    // Act
    render(<SolicitudesRecibidasAsesorPanel page={0} onPageChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it('sin solicitudes muestra el vacío del asesor y no un error', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadAsesorRecibidas).mockReturnValue(
      crearHookMock({ data: crearPagina([]) }),
    );

    // Act
    render(<SolicitudesRecibidasAsesorPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no has recibido solicitudes')).toBeInTheDocument();
    expect(
      screen.getByText('Cuando un estudiante te envíe una novedad, aparecerá aquí.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra remitente, mensaje y fecha, con la acción Responder', () => {
    // Arrange
    vi.mocked(useSolicitudesNovedadAsesorRecibidas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );

    // Act
    render(<SolicitudesRecibidasAsesorPanel page={0} onPageChange={vi.fn()} />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Solicitudes de novedad recibidas' });
    expect(screen.getByText('1 solicitud')).toBeInTheDocument();
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText('Mi asesor no responde.')).toBeInTheDocument();
    expect(within(tabla).getByText(/2026/)).toBeInTheDocument();
    expect(
      within(tabla).getByRole('button', { name: 'Responder la solicitud de Luis Gómez' }),
    ).toBeInTheDocument();
  });

  it('Responder abre el panel y un envío válido llama al hook del asesor y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockearResponder(
      vi.fn((_req: unknown, opciones?: { onSuccess?: () => void }) => opciones?.onSuccess?.()),
    );
    vi.mocked(useSolicitudesNovedadAsesorRecibidas).mockReturnValue(
      crearHookMock({ data: crearPagina([SOLICITUD]) }),
    );
    render(<SolicitudesRecibidasAsesorPanel page={0} onPageChange={vi.fn()} />);

    // Act
    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Responder la solicitud de Luis Gómez',
      }),
    );
    const dialogo = screen.getByRole('dialog', { name: 'Responder solicitud' });
    expect(within(dialogo).getByText('Mi asesor no responde.')).toBeInTheDocument();
    await user.type(within(dialogo).getByRole('textbox', { name: /Respuesta/ }), 'Hablemos.');
    await user.click(within(dialogo).getByRole('button', { name: 'Enviar respuesta' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { solicitudId: 's-1', contenido: 'Hablemos.' },
      expect.anything(),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con varias páginas el paginador pide la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    vi.mocked(useSolicitudesNovedadAsesorRecibidas).mockReturnValue(
      crearHookMock({
        data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 },
      }),
    );

    // Act
    render(<SolicitudesRecibidasAsesorPanel page={0} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
