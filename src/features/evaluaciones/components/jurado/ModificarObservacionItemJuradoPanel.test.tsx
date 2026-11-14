import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import ModificarObservacionItemJuradoPanel from './ModificarObservacionItemJuradoPanel';
import { useModificarObservacionItemJurado } from '../../hooks/useModificarObservacionItemJurado';
import { toast } from '../../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../../shared/validation';
import type { ApiError } from '../../../../shared/models/api-response';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';

vi.mock('../../hooks/useModificarObservacionItemJurado', () => ({
  useModificarObservacionItemJurado: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useModificarMock = vi.mocked(useModificarObservacionItemJurado);

const OBSERVACION: ObservacionItemJurado = { id: 'obs-1', descripcion: 'Falta profundidad' };
const CAMPO = 'Observación';

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

type Mutacion = ReturnType<typeof useModificarObservacionItemJurado>;

function mockMutacion(mutate = vi.fn()) {
  useModificarMock.mockReturnValue({
    isPending: false,
    mutate,
    reset: vi.fn(),
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

function montar(onCerrar = vi.fn()) {
  const utilidades = render(
    <ModificarObservacionItemJuradoPanel
      observacion={OBSERVACION}
      nombreItem="Claridad"
      onCerrar={onCerrar}
    />,
  );
  return { onCerrar, ...utilidades };
}

function errorQueRespondeCon(errorCode: string) {
  return vi.fn((_req: unknown, opciones?: MutateOptions) =>
    opciones?.onError?.(
      crearErrorApi({ error: 'Unprocessable Entity', errorCode, message: 'x', status: 422 }),
    ),
  );
}

describe('ModificarObservacionItemJuradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parte con el texto actual, limita la longitud con LIMITES y deja guardar inactivo sin cambios', () => {
    // Arrange
    mockMutacion();

    // Act
    montar();

    // Assert
    expect(screen.getByLabelText(CAMPO)).toHaveValue(OBSERVACION.descripcion);
    expect(screen.getByLabelText(CAMPO)).toHaveAttribute(
      'maxlength',
      String(LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX),
    );
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('con el texto vacío muestra el requerido al salir del campo y no envía', async () => {
    // Arrange
    const mutate = mockMutacion();
    const user = userEvent.setup();
    montar();

    // Act
    await user.clear(screen.getByLabelText(CAMPO));
    await user.tab();

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(MENSAJES_VALIDACION.requerido);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía observacionId y descripción con trim, notifica el éxito y cierra', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.clear(screen.getByLabelText(CAMPO));
    await user.type(screen.getByLabelText(CAMPO), '  Nuevo texto  ');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { observacionId: 'obs-1', descripcion: 'Nuevo texto' },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Observación modificada',
      'El texto se guardó correctamente.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante la descripción duplicada lanza toast.error, pinta el campo y no cierra', async () => {
    // Arrange
    const mensaje = 'Ya hay otra observación con este texto para este ítem.';
    mockMutacion(errorQueRespondeCon('OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA'));
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.type(screen.getByLabelText(CAMPO), ' extra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText(CAMPO)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText(CAMPO)).toHaveAccessibleDescription(
      expect.stringContaining(mensaje),
    );
    expect(toast.error).toHaveBeenCalledWith('No se pudo modificar la observación', mensaje);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante observación inexistente lanza toast.error y vuelve a la lectura', async () => {
    // Arrange
    mockMutacion(errorQueRespondeCon('OBSERVACION_ITEM_JURADO_NO_ENCONTRADA'));
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.type(screen.getByLabelText(CAMPO), ' extra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo modificar la observación',
      'La observación ya no existe.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante evaluación finalizada lanza toast.error y vuelve a la lectura', async () => {
    // Arrange
    mockMutacion(errorQueRespondeCon('OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA'));
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.type(screen.getByLabelText(CAMPO), ' extra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo modificar la observación',
      'La evaluación está finalizada y no admite modificar observaciones.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
