import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import SolicitudNovedadForm from './SolicitudNovedadForm';
import type { TextosSolicitudNovedad } from './SolicitudNovedadForm';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const TEXTOS: TextosSolicitudNovedad = {
  titulo: 'Enviar solicitud de novedad al coordinador',
  etiquetaDestinatario: 'Destinatario (UUID del coordinador)',
  placeholderMensaje: 'Describe la novedad',
  recursoAviso: 'coordinadores',
  tituloConfirmacion: 'Enviar solicitud al coordinador',
  descripcionConfirmacion: 'Se enviará un mensaje de novedad. ¿Deseas continuar?',
  mensajeExito: 'El coordinador recibirá tu mensaje.',
};

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'No he podido contactar a mi asesor.';

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

function renderizarFormulario(enviar = vi.fn(), enviando = false) {
  render(
    <SolicitudNovedadForm textos={TEXTOS} enviar={enviar} enviando={enviando} reiniciar={vi.fn()} />,
  );
  return enviar;
}

async function llenarFormularioValido(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText(/Destinatario/));
  await user.paste(UUID_VALIDO);
  await user.click(screen.getByLabelText(/^Mensaje/));
  await user.paste(MENSAJE_VALIDO);
}

describe('SolicitudNovedadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mantiene Enviar solicitud deshabilitado hasta que los campos son válidos y muestra el aviso de catálogo no disponible', async () => {
    renderizarFormulario();
    const user = userEvent.setup();
    const submit = screen.getByRole('button', { name: 'Enviar solicitud' });

    await waitFor(() => expect(submit).toBeDisabled());
    expect(screen.getByRole('note', { name: 'No disponible: coordinadores' })).toBeInTheDocument();

    await llenarFormularioValido(user);

    await waitFor(() => expect(submit).toBeEnabled());
  });

  it('bloquea el envío cuando el destinatario no tiene formato UUID', async () => {
    renderizarFormulario();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/Destinatario/));
    await user.paste('no-es-un-uuid');
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);

    expect(await screen.findByText('Identificador inválido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('abre el diálogo de confirmación al enviar y lo cierra sin llamar a mutate al cancelar', async () => {
    const mutate = renderizarFormulario();
    const user = userEvent.setup();

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('Enviar solicitud al coordinador');
    expect(mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar con datos válidos, envía la solicitud, notifica el éxito y limpia el formulario', async () => {
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    renderizarFormulario(mutate);
    const user = userEvent.setup();

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: UUID_VALIDO, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Solicitud enviada', TEXTOS.mensajeExito);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Destinatario/)).toHaveValue('');
  });

  it('pinta el error en el campo destinatario y notifica cuando el backend responde DESTINATARIO_NO_ENCONTRADO', async () => {
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'DESTINATARIO_NO_ENCONTRADO',
          message: 'El coordinador indicado no existe.',
          status: 422,
        }),
      ),
    );
    renderizarFormulario(mutate);
    const user = userEvent.setup();

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('El coordinador indicado no existe.')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo enviar la solicitud',
      'El coordinador indicado no existe.',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('notifica con toast sin marcar ningún campo cuando el backend responde SOLICITUD_DUPLICADA', async () => {
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'SOLICITUD_DUPLICADA',
          message: 'Ya enviaste esta misma solicitud hoy.',
          status: 422,
        }),
      ),
    );
    renderizarFormulario(mutate);
    const user = userEvent.setup();

    await llenarFormularioValido(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo enviar la solicitud',
        'Ya enviaste esta misma solicitud hoy.',
      ),
    );
    expect(screen.queryByText('Ya enviaste esta misma solicitud hoy.')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Destinatario/)).toHaveValue(UUID_VALIDO);
  });

  it('abre la confirmación al enviar con Enter, pinta los errores de campos del formulario e ignora los ajenos', async () => {
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Bad Request',
          message: 'Datos inválidos.',
          status: 400,
          fieldErrors: [
            { field: 'mensajeSolicitud', message: 'El mensaje excede el límite.' },
            { field: 'campoAjeno', message: 'No debe pintarse.' },
          ],
        }),
      ),
    );
    renderizarFormulario(mutate);
    const user = userEvent.setup();

    await llenarFormularioValido(user);
    await user.click(screen.getByLabelText(/Destinatario/));
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('El mensaje excede el límite.')).toBeInTheDocument();
    expect(screen.queryByText('No debe pintarse.')).not.toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('No se pudo enviar la solicitud', 'Datos inválidos.');
  });
});
