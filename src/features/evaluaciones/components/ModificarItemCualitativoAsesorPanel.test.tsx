import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../test-utils/render';
import ModificarItemCualitativoAsesorPanel from './ModificarItemCualitativoAsesorPanel';
import { useModificarItemCualitativoAsesor } from '../hooks/useModificarItemCualitativoAsesor';
import { toast } from '../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import type { ApiError } from '../../../shared/models/api-response';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';

vi.mock('../hooks/useModificarItemCualitativoAsesor', () => ({
  useModificarItemCualitativoAsesor: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useModificarMock = vi.mocked(useModificarItemCualitativoAsesor);

const ITEM: ItemCualitativoAsesor = {
  id: 'i-1',
  nombre: 'Claridad',
  descripcion: 'El documento se comprende sin ambigüedades.',
  peso: 120,
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

type Mutacion = ReturnType<typeof useModificarItemCualitativoAsesor>;

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useModificarMock.mockReturnValue({
    isPending,
    mutate,
    reset: vi.fn(),
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

describe('ModificarItemCualitativoAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('precarga la descripción, muestra el nombre en solo lectura y limita la longitud con LIMITES', () => {
    // Arrange
    mockMutacion();

    // Act
    render(<ModificarItemCualitativoAsesorPanel item={ITEM} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText('Nombre')).toHaveValue(ITEM.nombre);
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Descripción')).toHaveValue(ITEM.descripcion);
    expect(screen.getByLabelText('Peso')).toHaveValue(String(ITEM.peso));
    expect(screen.getByLabelText('Descripción')).toHaveAttribute(
      'maxlength',
      String(LIMITES.ITEM_CUALITATIVO_ASESOR_DESCRIPCION_MAX),
    );
  });

  it('sin cambios deja «Guardar cambios» inactivo', () => {
    // Arrange
    mockMutacion();

    // Act
    render(<ModificarItemCualitativoAsesorPanel item={ITEM} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('con la descripción vacía muestra el requerido al salir del campo', async () => {
    // Arrange
    mockMutacion();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoAsesorPanel item={ITEM} onCerrar={vi.fn()} />);

    // Act
    await user.clear(screen.getByLabelText('Descripción'));
    await user.tab();

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(MENSAJES_VALIDACION.requerido);
  });

  it('envía itemId y descripción con trim, notifica el éxito y cierra', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoAsesorPanel item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.clear(screen.getByLabelText('Descripción'));
    await user.type(screen.getByLabelText('Descripción'), '  Nueva descripción  ');
    await user.clear(screen.getByLabelText('Peso'));
    await user.type(screen.getByLabelText('Peso'), '300');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { itemId: 'i-1', descripcion: 'Nueva descripción', peso: 300 },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Ítem modificado',
      expect.stringContaining('Claridad'),
    );
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
          fieldErrors: [{ field: 'peso', message: 'Peso fuera de rango' }],
        }),
      ),
    );
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoAsesorPanel item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByLabelText('Descripción'), ' extra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText('Peso')).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText('Peso')).toHaveAccessibleDescription('Peso fuera de rango');
    expect(toast.error).toHaveBeenCalledWith('No se pudo modificar el ítem', 'Datos inválidos');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante el 422 de ítem no encontrado lanza toast.error y vuelve a la lista', async () => {
    // Arrange
    const mensaje = 'El ítem no existe.';
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'ITEM_CUALITATIVO_ASESOR_NO_ENCONTRADO',
          message: mensaje,
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<ModificarItemCualitativoAsesorPanel item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByLabelText('Descripción'), ' extra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo modificar el ítem', mensaje);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
