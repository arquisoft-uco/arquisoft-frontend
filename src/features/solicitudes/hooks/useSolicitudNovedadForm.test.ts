import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '../../../test-utils/render';
import { AxiosError, AxiosHeaders } from 'axios';
import { useSolicitudNovedadForm } from './useSolicitudNovedadForm';
import { toast } from '../../../shared/hooks/useToast';
import type { ApiError } from '../../../shared/models/api-response';

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const MENSAJE_VALIDO = 'No he podido contactar a mi asesor.';
const MENSAJE_EXITO = 'Tu asesor recibirá el mensaje.';

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type Opciones = { onSuccess: () => void; onError: (err: unknown) => void };

function renderizarHook(enviar = vi.fn(), reiniciar = vi.fn()) {
  const hook = renderHook(() =>
    useSolicitudNovedadForm({ mensajeExito: MENSAJE_EXITO, enviar, reiniciar }),
  );
  return { ...hook, enviar, reiniciar };
}

async function escribirCampos(result: ReturnType<typeof renderizarHook>['result']) {
  await act(async () => {
    await result.current.register('destinatario').onChange({
      target: { name: 'destinatario', value: UUID_VALIDO },
      type: 'change',
    });
    await result.current.register('mensajeSolicitud').onChange({
      target: { name: 'mensajeSolicitud', value: MENSAJE_VALIDO },
      type: 'change',
    });
  });
}

describe('useSolicitudNovedadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('al enviar vacío muestra el resumen de errores y no abre la confirmación', async () => {
    const { result } = renderizarHook();

    await act(async () => {
      await result.current.alEnviarFormulario();
    });

    expect(result.current.resumenVisible).toBe(true);
    expect(result.current.confirmando).toBe(false);
    expect(result.current.errors.destinatario).toBeDefined();
    expect(result.current.errors.mensajeSolicitud).toBeDefined();
  });

  it('con datos válidos abre la confirmación sin enviar hasta confirmar, y cancelar la cierra', async () => {
    const { result, enviar } = renderizarHook();
    await escribirCampos(result);

    await act(async () => {
      await result.current.alEnviarFormulario();
    });

    expect(result.current.confirmando).toBe(true);
    expect(result.current.resumenVisible).toBe(false);
    expect(enviar).not.toHaveBeenCalled();

    act(() => result.current.cancelarConfirmacion());

    expect(result.current.confirmando).toBe(false);
    expect(enviar).not.toHaveBeenCalled();
  });

  it('al confirmar envía los valores y, en éxito, notifica, reinicia y oculta el resumen', async () => {
    const enviar = vi.fn((_body: unknown, opciones: Opciones) => opciones.onSuccess());
    const { result, reiniciar } = renderizarHook(enviar);
    await escribirCampos(result);
    await act(async () => {
      await result.current.alEnviarFormulario();
    });

    await act(async () => {
      result.current.confirmar();
    });

    expect(enviar).toHaveBeenCalledWith(
      { destinatario: UUID_VALIDO, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Solicitud enviada', MENSAJE_EXITO);
    expect(reiniciar).toHaveBeenCalledTimes(1);
    expect(result.current.confirmando).toBe(false);
    expect(result.current.resumenVisible).toBe(false);
  });

  it('en error de destinatario marca el campo, notifica y muestra el resumen', async () => {
    const enviar = vi.fn((_body: unknown, opciones: Opciones) =>
      opciones.onError(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'DESTINATARIO_NO_ASIGNADO',
          message: 'El destinatario no es tu asesor.',
          status: 422,
        }),
      ),
    );
    const { result } = renderizarHook(enviar);
    await escribirCampos(result);
    await act(async () => {
      await result.current.alEnviarFormulario();
    });

    await act(async () => {
      result.current.confirmar();
    });

    expect(result.current.errors.destinatario?.message).toBe('El destinatario no es tu asesor.');
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo enviar la solicitud',
      'El destinatario no es tu asesor.',
    );
    expect(result.current.confirmando).toBe(false);
    expect(result.current.resumenVisible).toBe(true);
  });

  it('irAlCampo no falla con un campo ajeno al formulario', () => {
    const { result } = renderizarHook();

    expect(() => act(() => result.current.irAlCampo('campoAjeno'))).not.toThrow();
  });
});
