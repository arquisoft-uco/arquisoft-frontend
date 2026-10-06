import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../test-utils/render';
import ModificarItemCualitativoJurado from './ModificarItemCualitativoJurado';
import { useModificarItemCualitativoJurado } from '../hooks/useModificarItemCualitativoJurado';
import { toast } from '../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import type { ApiError } from '../../../shared/models/api-response';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';

vi.mock('../hooks/useModificarItemCualitativoJurado', () => ({
  useModificarItemCualitativoJurado: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useModificarMock = vi.mocked(useModificarItemCualitativoJurado);

const ITEM: ItemCualitativoJurado = {
  id: 'i-1',
  nombre: 'Claridad',
  descripcion: 'El documento se comprende sin ambigüedades.',
};

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

type Mutacion = ReturnType<typeof useModificarItemCualitativoJurado>;

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useModificarMock.mockReturnValue({
    isPending,
    mutate,
    reset: vi.fn(),
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

describe('ModificarItemCualitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('precarga la descripción, muestra el nombre en solo lectura y limita la longitud con LIMITES', () => {
    // Arrange
    mockMutacion();

    // Act
    render(<ModificarItemCualitativoJurado item={ITEM} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText('Nombre')).toHaveValue(ITEM.nombre);
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Descripción')).toHaveValue(ITEM.descripcion);
    expect(screen.getByLabelText('Descripción')).toHaveAttribute(
      'maxlength',
      String(LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX),
    );
  });

  it('con la descripción vacía muestra el requerido y deshabilita el envío', async () => {
    // Arrange
    mockMutacion();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoJurado item={ITEM} onCerrar={vi.fn()} />);

    // Act
    await user.clear(screen.getByLabelText('Descripción'));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(MENSAJES_VALIDACION.requerido);
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('envía itemId y descripción con trim, notifica el éxito y cierra', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoJurado item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.clear(screen.getByLabelText('Descripción'));
    await user.type(screen.getByLabelText('Descripción'), '  Nueva descripción  ');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { itemId: 'i-1', descripcion: 'Nueva descripción' },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem modificado', expect.stringContaining('Claridad'));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('pinta el error 400 en el campo, lanza toast.error y no cierra', async () => {
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
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoJurado item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByLabelText('Descripción'), ' extra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Descripción no permitida');
    expect(screen.getByLabelText('Descripción')).toHaveAttribute('aria-invalid', 'true');
    expect(toast.error).toHaveBeenCalledWith('Error al modificar el ítem', 'Datos inválidos');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante el 422 de ítem no encontrado lanza toast.error y vuelve a la lista', async () => {
    // Arrange
    const mensaje = 'El ítem no existe.';
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO',
          message: mensaje,
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoJurado item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByLabelText('Descripción'), ' extra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al modificar el ítem', mensaje);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra sin enviar', async () => {
    // Arrange
    const mutate = mockMutacion();
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoJurado item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});
