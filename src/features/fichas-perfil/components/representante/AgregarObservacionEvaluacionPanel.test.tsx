import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import AgregarObservacionEvaluacionPanel from './AgregarObservacionEvaluacionPanel';
import { useAgregarObservacionEvaluacion } from '../../hooks/useAgregarObservacionEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../../shared/validation';
import type { ApiError } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useAgregarObservacionEvaluacion', () => ({
  useAgregarObservacionEvaluacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

function mockMutacion(parcial: Record<string, unknown>) {
  vi.mocked(useAgregarObservacionEvaluacion).mockReturnValue({
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    ...parcial,
  } as never);
}

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('AgregarObservacionEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutacion({});
  });

  it('no deshabilita el envío por validez: vacío o en blanco muestra el error del campo y el resumen, sin enviar', async () => {
    // Arrange
    const mutate = vi.fn();
    mockMutacion({ mutate });
    const user = userEvent.setup();
    render(<AgregarObservacionEvaluacionPanel evaluacionId="ev-1" />);
    const boton = screen.getByRole('button', { name: 'Agregar observación' });

    // Assert
    expect(boton).toBeEnabled();
    expect(screen.getByText(`0/${LIMITES.OBSERVACION_EVALUACION_MAX}`)).toBeInTheDocument();

    // Act
    await user.click(boton);

    // Assert
    expect(screen.getByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(MENSAJES_VALIDACION.requerido)).length).toBeGreaterThan(
      0,
    );

    // Act
    await user.type(screen.getByLabelText('Observación'), '   ');
    await user.click(boton);

    // Assert
    expect(mutate).not.toHaveBeenCalled();
  });

  it('muestra el error de longitud al salir del campo y no envía cuando se supera el máximo', async () => {
    // Arrange
    const mutate = vi.fn();
    mockMutacion({ mutate });
    const user = userEvent.setup();
    render(<AgregarObservacionEvaluacionPanel evaluacionId="ev-1" />);
    const campo = screen.getByLabelText('Observación');
    const textoLargo = 'a'.repeat(LIMITES.OBSERVACION_EVALUACION_MAX + 1);

    // Act: el maxLength del textarea impide teclear de más, se fuerza el valor largo
    expect(campo).toHaveAttribute('maxlength', String(LIMITES.OBSERVACION_EVALUACION_MAX));
    campo.removeAttribute('maxlength');
    await user.click(campo);
    await user.paste(textoLargo);
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    expect(
      (
        await screen.findAllByText(
          MENSAJES_VALIDACION.longitudMaxima(LIMITES.OBSERVACION_EVALUACION_MAX),
        )
      ).length,
    ).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía la observación recortada con el id de la evaluación', async () => {
    // Arrange
    const mutate = vi.fn();
    mockMutacion({ mutate });
    const user = userEvent.setup();
    render(<AgregarObservacionEvaluacionPanel evaluacionId="ev-1" />);

    // Act
    await user.type(screen.getByLabelText('Observación'), '  Buen avance  ');
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { evaluacionFichaPerfilId: 'ev-1', observacion: 'Buen avance' },
      expect.any(Object),
    );
  });

  it('muestra el toast de éxito y limpia el campo cuando el envío tiene éxito', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    const reset = vi.fn();
    mockMutacion({ mutate, reset });
    const user = userEvent.setup();
    render(<AgregarObservacionEvaluacionPanel evaluacionId="ev-1" />);

    // Act
    await user.type(screen.getByLabelText('Observación'), 'Buen avance');
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    expect(toast.success).toHaveBeenCalledWith('Observación agregada', expect.any(String));
    expect(reset).toHaveBeenCalled();
    expect(screen.getByLabelText('Observación')).toHaveValue('');
  });

  it('si el backend señala el campo, muestra el toast y el error junto al campo conservando el texto', async () => {
    // Arrange
    const errorApi = crearErrorApi({
      error: 'Unprocessable Entity',
      errorCode: 'OBSERVACION_EVALUACION_DUPLICADA',
      message: 'La observación ya existe en la evaluación.',
      status: 422,
      fieldErrors: [{ field: 'observacion', message: 'Observación duplicada.' }],
    });
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(errorApi),
    );
    mockMutacion({ mutate });
    const user = userEvent.setup();
    render(<AgregarObservacionEvaluacionPanel evaluacionId="ev-1" />);

    // Act
    await user.type(screen.getByLabelText('Observación'), 'Buen avance');
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo agregar la observación',
      'La observación ya existe en la evaluación.',
    );
    expect(screen.getAllByText('Observación duplicada.').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Observación')).toHaveValue('Buen avance');
  });

  it('si el error no señala el campo, solo avisa con el toast y conserva el texto', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(new Error('Red caída')),
    );
    mockMutacion({ mutate });
    const user = userEvent.setup();
    render(<AgregarObservacionEvaluacionPanel evaluacionId="ev-1" />);

    // Act
    await user.type(screen.getByLabelText('Observación'), 'Buen avance');
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo agregar la observación',
      expect.any(String),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Observación')).toHaveValue('Buen avance');
  });

  it('deshabilita el botón y muestra Agregando... mientras el envío está en curso', async () => {
    // Arrange
    mockMutacion({ isPending: true });
    const user = userEvent.setup();
    render(<AgregarObservacionEvaluacionPanel evaluacionId="ev-1" />);

    // Act
    await user.type(screen.getByLabelText('Observación'), 'Buen avance');

    // Assert
    expect(screen.getByRole('button', { name: 'Agregando...' })).toBeDisabled();
  });
});
