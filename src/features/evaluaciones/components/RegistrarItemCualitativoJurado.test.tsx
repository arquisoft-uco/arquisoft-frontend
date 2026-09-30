import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../test-utils/render';
import RegistrarItemCualitativoJurado from './RegistrarItemCualitativoJurado';
import { useRegistrarItemCualitativoJurado } from '../hooks/useRegistrarItemCualitativoJurado';
import { toast } from '../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import type { ApiError } from '../../../shared/models/api-response';

vi.mock('../hooks/useRegistrarItemCualitativoJurado', () => ({
  useRegistrarItemCualitativoJurado: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useRegistrarMock = vi.mocked(useRegistrarItemCualitativoJurado);

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

type Mutacion = ReturnType<typeof useRegistrarItemCualitativoJurado>;

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useRegistrarMock.mockReturnValue({
    data: undefined,
    error: null,
    status: isPending ? 'pending' : 'idle',
    isError: false,
    isIdle: !isPending,
    isPending,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

async function llenarValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre'), 'Claridad');
  await user.type(screen.getByLabelText('Descripción'), 'Se comprende sin ambigüedades.');
}

describe('RegistrarItemCualitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exige nombre y descripción, deshabilita el envío y limita la longitud con LIMITES', async () => {
    // Arrange
    mockMutacion();
    const user = userEvent.setup();
    render(<RegistrarItemCualitativoJurado onCerrar={vi.fn()} />);
    const nombre = screen.getByLabelText('Nombre');
    const descripcion = screen.getByLabelText('Descripción');

    // Act
    await user.type(nombre, 'a');
    await user.clear(nombre);
    await user.type(descripcion, '   ');

    // Assert
    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    expect(screen.getAllByText(MENSAJES_VALIDACION.requerido)).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Registrar ítem' })).toBeDisabled();
    expect(nombre).toHaveAttribute('maxlength', String(LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX));
    expect(descripcion).toHaveAttribute(
      'maxlength',
      String(LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX),
    );
  });

  it('envía con datos válidos, notifica el éxito y cierra el formulario', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarItemCualitativoJurado onCerrar={onCerrar} />);

    // Act
    await llenarValido(user);
    await user.click(screen.getByRole('button', { name: 'Registrar ítem' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { nombre: 'Claridad', descripcion: 'Se comprende sin ambigüedades.' },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem registrado', expect.stringContaining('Claridad'));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('pinta el 422 de nombre duplicado en el campo nombre, lanza toast y no cierra', async () => {
    // Arrange
    const mensaje = 'Ya existe un ítem con ese nombre.';
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'ITEM_CUALITATIVO_JURADO_NOMBRE_DUPLICADO',
          message: mensaje,
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarItemCualitativoJurado onCerrar={onCerrar} />);

    // Act
    await llenarValido(user);
    await user.click(screen.getByRole('button', { name: 'Registrar ítem' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(mensaje);
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nombre')).toHaveValue('Claridad');
    expect(toast.error).toHaveBeenCalledWith('Error al registrar el ítem', mensaje);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('pinta el error 400 de fieldErrors en el campo indicado', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Bad Request',
          message: 'Datos inválidos',
          status: 400,
          fieldErrors: [{ field: 'descripcion', message: 'Descripción no permitida' }],
        }),
      ),
    );
    mockMutacion(mutate);
    const user = userEvent.setup();
    render(<RegistrarItemCualitativoJurado onCerrar={vi.fn()} />);

    // Act
    await llenarValido(user);
    await user.click(screen.getByRole('button', { name: 'Registrar ítem' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Descripción no permitida');
    expect(screen.getByLabelText('Descripción')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'false');
    expect(toast.error).toHaveBeenCalledWith('Error al registrar el ítem', 'Datos inválidos');
  });

  it('durante el envío deshabilita el botón y marca el formulario como ocupado', () => {
    // Arrange
    mockMutacion(vi.fn(), true);

    // Act
    render(<RegistrarItemCualitativoJurado onCerrar={vi.fn()} />);

    // Assert
    const boton = screen.getByRole('button', { name: 'Registrando...' });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
  });

  it('al cancelar cierra el formulario sin enviar', async () => {
    // Arrange
    const mutate = mockMutacion();
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarItemCualitativoJurado onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});
