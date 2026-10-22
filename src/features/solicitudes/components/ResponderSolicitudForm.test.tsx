import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { ApiError } from '../../../shared/models/api-response';
import { LIMITES } from '../../../shared/validation';
import type { Solicitud } from '../models/Solicitud';
import ResponderSolicitudForm from './ResponderSolicitudForm';

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type OpcionesMutate = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

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

const reiniciar = vi.fn();

function renderizar(
  props: {
    responder?: (req: unknown, opciones: OpcionesMutate) => void;
    respondiendo?: boolean;
    onCerrar?: () => void;
  } = {},
) {
  const responder = vi.fn(props.responder ?? (() => undefined));
  render(
    <ResponderSolicitudForm
      solicitud={SOLICITUD}
      onCerrar={props.onCerrar ?? vi.fn()}
      responder={responder}
      respondiendo={props.respondiendo ?? false}
      reiniciar={reiniciar}
    />,
  );
  return responder;
}

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('ResponderSolicitudForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el contexto de la solicitud y limita el campo a la longitud del backend', () => {
    // Arrange / Act
    renderizar();

    // Assert
    expect(screen.getByRole('region', { name: 'Mensaje original' })).toHaveTextContent(
      'No he podido contactar a mi asesor.',
    );
    expect(screen.getByRole('textbox', { name: /Respuesta/ })).toHaveAttribute(
      'maxLength',
      String(LIMITES.RESPUESTA_CONTENIDO_MAX),
    );
  });

  it('enviar vacío muestra el resumen de errores y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    // Assert
    expect(await screen.findByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('en éxito envía solicitudId y el contenido recortado, lanza el toast y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = vi.fn((_req: unknown, opciones?: OpcionesMutate) => opciones?.onSuccess?.());
    renderizar({ responder: mutate, onCerrar });

    // Act
    await user.type(
      screen.getByRole('textbox', { name: /Respuesta/ }),
      '  Agendemos una reunión.  ',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { solicitudId: 's-1', contenido: 'Agendemos una reunión.' },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Respuesta enviada',
      expect.stringContaining('Luis Gómez'),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('en error pinta el mensaje del campo, lanza toast.error y no cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const responder = vi.fn((_req: unknown, opciones?: OpcionesMutate) =>
      opciones?.onError?.(
        crearErrorApi({
          status: 400,
          message: 'Datos inválidos',
          errorCode: 'RESPUESTA_CONTENIDO_REQUERIDO',
          fieldErrors: [{ field: 'contenido', message: 'La respuesta es obligatoria.' }],
        } as ApiError),
      ),
    );
    renderizar({ responder, onCerrar });

    // Act
    await user.type(screen.getByRole('textbox', { name: /Respuesta/ }), 'Hola');
    await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }));

    // Assert
    expect(await screen.findAllByText('La respuesta es obligatoria.')).not.toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith('No se pudo enviar la respuesta', 'Datos inválidos');
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Respuesta/ })).toHaveValue('Hola');
  });

  it('cerrar sin cambios llama a onCerrar sin enviar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = renderizar({ onCerrar });

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('con cambios, cancelar pide confirmar el descarte antes de cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    renderizar({ onCerrar });
    await user.type(screen.getByRole('textbox', { name: /Respuesta/ }), 'Borrador');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCerrar).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('mientras envía bloquea Cerrar e ignora Escape', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    renderizar({ respondiendo: true, onCerrar });

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('button', { name: /Enviando…/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled();
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
