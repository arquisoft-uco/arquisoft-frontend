import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import ModificarObservacionItemAsesorPanel from './ModificarObservacionItemAsesorPanel';
import { useModificarObservacionItemAsesor } from '../../hooks/useModificarObservacionItemAsesor';
import { toast } from '../../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../../shared/validation';
import type { ApiError } from '../../../../shared/models/api-response';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';

vi.mock('../../hooks/useModificarObservacionItemAsesor', () => ({
  useModificarObservacionItemAsesor: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useModificarMock = vi.mocked(useModificarObservacionItemAsesor);

const OBSERVACION: ObservacionItemAsesor = { id: 'obs-1', descripcion: 'Falta profundidad' };
const CAMPO = 'Observación';
const MENSAJE_SERVIDOR = 'Mensaje del servidor';

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

type Mutacion = ReturnType<typeof useModificarObservacionItemAsesor>;

function mockMutacion(mutate = vi.fn()) {
  useModificarMock.mockReturnValue({
    isPending: false,
    mutate,
    reset: vi.fn(),
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

function montar(onCerrar = vi.fn()) {
  render(
    <ModificarObservacionItemAsesorPanel
      observacion={OBSERVACION}
      nombreItem="Claridad"
      onCerrar={onCerrar}
    />,
  );
  return { onCerrar };
}

function errorQueRespondeCon(cuerpo: Partial<ApiError>) {
  return vi.fn((_req: unknown, opciones?: MutateOptions) =>
    opciones?.onError?.(
      crearErrorApi({
        error: 'Error',
        errorCode: 'X',
        message: MENSAJE_SERVIDOR,
        status: 422,
        ...cuerpo,
      }),
    ),
  );
}

async function escribirYGuardar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(CAMPO), ' extra');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
}

describe('ModificarObservacionItemAsesorPanel', () => {
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
      String(LIMITES.OBSERVACION_ITEM_ASESOR_DESCRIPCION_MAX),
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
    mockMutacion(
      errorQueRespondeCon({ errorCode: 'OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA' }),
    );
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await escribirYGuardar(user);

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText(CAMPO)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText(CAMPO)).toHaveAccessibleDescription(
      expect.stringContaining(MENSAJE_SERVIDOR),
    );
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo modificar la observación',
      MENSAJE_SERVIDOR,
    );
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('un 400 con fieldErrors de descripcion lo pinta en el campo y no cierra', async () => {
    // Arrange
    mockMutacion(
      errorQueRespondeCon({
        status: 400,
        errorCode: 'VALIDATION_ERROR',
        fieldErrors: [{ field: 'descripcion', message: 'Texto inválido del servidor' }],
      }),
    );
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await escribirYGuardar(user);

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText(CAMPO)).toHaveAccessibleDescription(
        expect.stringContaining('Texto inválido del servidor'),
      ),
    );
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it.each([
    ['observación inexistente', 'OBSERVACION_ITEM_ASESOR_NO_ENCONTRADA'],
    ['otro asesor', 'EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR'],
    ['evaluación finalizada', 'OBSERVACION_ITEM_ASESOR_MODIFICACION_EVALUACION_FINALIZADA'],
  ])('ante %s lanza toast.error con el mensaje del servidor y cierra', async (_caso, errorCode) => {
    // Arrange
    mockMutacion(errorQueRespondeCon({ errorCode }));
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await escribirYGuardar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo modificar la observación',
      MENSAJE_SERVIDOR,
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
