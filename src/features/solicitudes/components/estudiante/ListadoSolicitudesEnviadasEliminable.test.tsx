import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError, Page } from '../../../../shared/models/api-response';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesEnviadasEliminable from './ListadoSolicitudesEnviadasEliminable';

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type OpcionesEliminar = { onSuccess: () => void; onError: (err: unknown) => void };

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

const PAGINA: Page<Solicitud> = {
  content: [SOLICITUD],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  empty: false,
};

const CONSULTA = {
  data: PAGINA,
  error: null,
  isLoading: false,
  isError: false,
  isFetching: false,
  isPlaceholderData: false,
  refetch: vi.fn(),
  page: 0,
  pageSize: 10,
  goToPage: vi.fn(),
};

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function abrirDialogo(
  eliminar: (id: string, opciones: OpcionesEliminar) => void,
  tipo: 'asesor' | 'cambio-asesor' | 'ampliacion-plazo' = 'asesor',
) {
  const user = userEvent.setup();
  render(
    <ListadoSolicitudesEnviadasEliminable
      tipo={tipo}
      consulta={CONSULTA}
      eliminar={eliminar}
      eliminando={false}
    />,
  );
  await user.click(
    within(screen.getByRole('table')).getByRole('button', {
      name: 'Eliminar la solicitud enviada a Ana Pérez',
    }),
  );
  return user;
}

describe('ListadoSolicitudesEnviadasEliminable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('al pulsar eliminar abre el diálogo con el destinatario y las consecuencias', async () => {
    // Arrange / Act
    await abrirDialogo(vi.fn());

    // Assert
    const dialogo = screen.getByRole('alertdialog');
    expect(dialogo).toHaveTextContent('¿Eliminar solicitud?');
    expect(dialogo).toHaveTextContent('Vas a eliminar la solicitud enviada a Ana Pérez.');
    expect(dialogo).toHaveTextContent('Dejará de aparecer en tus solicitudes enviadas.');
    expect(dialogo).toHaveTextContent('No se puede deshacer.');
  });

  it('cancelar el diálogo lo cierra sin eliminar', async () => {
    // Arrange
    const eliminar = vi.fn();
    const user = await abrirDialogo(eliminar);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(eliminar).not.toHaveBeenCalled();
  });

  it('al confirmar elimina por id y, en éxito, lanza el toast y cierra el diálogo', async () => {
    // Arrange
    const eliminar = vi.fn((_id: string, opciones: OpcionesEliminar) => opciones.onSuccess());
    const user = await abrirDialogo(eliminar);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(eliminar).toHaveBeenCalledWith('s-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Solicitud eliminada', expect.any(String));
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('en cambio de asesor el toast de éxito nombra el cambio de asesor', async () => {
    // Arrange
    const eliminar = vi.fn((_id: string, opciones: OpcionesEliminar) => opciones.onSuccess());
    const user = await abrirDialogo(eliminar, 'cambio-asesor');

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(toast.success).toHaveBeenCalledWith(
      'Solicitud eliminada',
      'La solicitud de cambio de asesor fue eliminada correctamente.',
    );
  });

  it('en ampliación de plazo el toast de éxito nombra la ampliación de plazo', async () => {
    // Arrange
    const eliminar = vi.fn((_id: string, opciones: OpcionesEliminar) => opciones.onSuccess());
    const user = await abrirDialogo(eliminar, 'ampliacion-plazo');

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(toast.success).toHaveBeenCalledWith(
      'Solicitud eliminada',
      'La solicitud de ampliación de plazo fue eliminada correctamente.',
    );
  });

  it('en error lanza toast.error con el mensaje del backend y cierra el diálogo', async () => {
    // Arrange
    const eliminar = vi.fn((_id: string, opciones: OpcionesEliminar) =>
      opciones.onError(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'SOLICITUD_CON_RESPUESTAS',
          message: 'La solicitud ya tiene respuestas y no puede eliminarse.',
          status: 422,
        }),
      ),
    );
    const user = await abrirDialogo(eliminar);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la solicitud',
      'La solicitud ya tiene respuestas y no puede eliminarse.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
