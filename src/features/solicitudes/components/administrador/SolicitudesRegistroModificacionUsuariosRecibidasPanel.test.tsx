import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import { useSolicitudesRegistroModificacionUsuariosRecibidas } from '../../hooks/useSolicitudesRegistroModificacionUsuariosRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesRegistroModificacionUsuariosRecibidasPanel from './SolicitudesRegistroModificacionUsuariosRecibidasPanel';

vi.mock('../../hooks/useSolicitudesRegistroModificacionUsuariosRecibidas', () => ({
  useSolicitudesRegistroModificacionUsuariosRecibidas: vi.fn(),
}));

type HookRecibidas = ReturnType<typeof useSolicitudesRegistroModificacionUsuariosRecibidas>;

const SOLICITUD: Solicitud = {
  id: 's-1',
  mensajeSolicitud: 'Registrar al estudiante Pedro Pérez.',
  fechaCreacion: '2026-09-01T15:30:00Z',
  tipoSolicitudId: 't-5',
  tipoSolicitudNombre: 'REGISTRO_Y_MODIFICACION_DE_USUARIOS',
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
  vi.mocked(useSolicitudesRegistroModificacionUsuariosRecibidas).mockReturnValue({
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

function renderizarPanel(onPageChange = vi.fn()) {
  render(
    <SolicitudesRegistroModificacionUsuariosRecibidasPanel page={0} onPageChange={onPageChange} />,
  );
}

describe('SolicitudesRegistroModificacionUsuariosRecibidasPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el esqueleto de carga y no la tabla', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    renderizarPanel();

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
    renderizarPanel();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las solicitudes');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío propio del administrador cuando no hay solicitudes', () => {
    // Arrange
    mockearHook({ data: crearPagina([]) });

    // Act
    renderizarPanel();

    // Assert
    expect(screen.getByText('Aún no has recibido solicitudes')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cuando un coordinador solicite registrar o modificar usuarios, aparecerá aquí.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con datos muestra remitente, mensaje y fecha, y no ofrece Responder', () => {
    // Arrange
    mockearHook({ data: crearPagina([SOLICITUD]) });

    // Act
    renderizarPanel();

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Solicitudes de registro y modificación de usuarios recibidas',
    });
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText(/luis@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('Registrar al estudiante Pedro Pérez.')).toBeInTheDocument();
    expect(tabla.querySelector('time')).toHaveAttribute('datetime', SOLICITUD.fechaCreacion);
    expect(screen.queryByRole('button', { name: /responder/i })).not.toBeInTheDocument();
  });

  it('con varias páginas el paginador llama a onPageChange con la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    mockearHook({ data: { ...crearPagina([SOLICITUD]), totalElements: 25, totalPages: 3 } });

    // Act
    renderizarPanel(onPageChange);
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
