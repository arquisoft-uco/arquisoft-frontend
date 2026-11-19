import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import RegistrarObservacionItemAsesorPanel from './RegistrarObservacionItemAsesorPanel';
import { useRegistrarObservacionItemAsesor } from '../../hooks/useRegistrarObservacionItemAsesor';
import { toast } from '../../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../../shared/validation';
import type { ApiError } from '../../../../shared/models/api-response';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';

vi.mock('../../hooks/useRegistrarObservacionItemAsesor', () => ({
  useRegistrarObservacionItemAsesor: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useRegistrarMock = vi.mocked(useRegistrarObservacionItemAsesor);

const EVALUACION: EvaluacionCuantitativaAsesor = {
  id: 'ec-1',
  puntaje: 40,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: 'c-1',
    valor: 50,
  },
};
const CAMPO = 'Observación';
const BOTON = 'Registrar observación';

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

type Mutacion = ReturnType<typeof useRegistrarObservacionItemAsesor>;

function mockMutacion(mutate = vi.fn()) {
  useRegistrarMock.mockReturnValue({
    isPending: false,
    mutate,
    reset: vi.fn(),
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

function montar(onCerrar = vi.fn()) {
  render(<RegistrarObservacionItemAsesorPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);
  return { onCerrar };
}

function errorQueRespondeCon(cuerpo: Partial<ApiError> & { status: number }) {
  return vi.fn((_req: unknown, opciones?: MutateOptions) =>
    opciones?.onError?.(crearErrorApi({ error: 'Error', message: 'x', ...cuerpo })),
  );
}

describe('RegistrarObservacionItemAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id de la evaluación y la descripción, notifica el éxito y cierra', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.type(screen.getByLabelText(CAMPO), 'Falta rigor');
    await user.click(screen.getByRole('button', { name: BOTON }));

    // Assert
    expect(screen.getByLabelText(CAMPO)).toHaveAttribute(
      'maxlength',
      String(LIMITES.OBSERVACION_ITEM_ASESOR_DESCRIPCION_MAX),
    );
    expect(mutate).toHaveBeenCalledWith(
      { evaluacionCuantitativaAsesorId: 'ec-1', descripcion: 'Falta rigor' },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Observación registrada',
      'La observación se guardó correctamente.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con la descripción vacía muestra el requerido al salir del campo y no envía', async () => {
    // Arrange
    const mutate = mockMutacion();
    const user = userEvent.setup();
    montar();

    // Act
    await user.click(screen.getByLabelText(CAMPO));
    await user.tab();

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(MENSAJES_VALIDACION.requerido);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante la descripción duplicada lanza toast.error, pinta el campo y no cierra', async () => {
    // Arrange
    const mensaje = 'Ya existe una observación con este texto.';
    mockMutacion(
      errorQueRespondeCon({
        status: 422,
        errorCode: 'OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA',
        message: mensaje,
      }),
    );
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.type(screen.getByLabelText(CAMPO), 'Falta rigor');
    await user.click(screen.getByRole('button', { name: BOTON }));

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText(CAMPO)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText(CAMPO)).toHaveAccessibleDescription(
      expect.stringContaining(mensaje),
    );
    expect(screen.getByLabelText(CAMPO)).toHaveValue('Falta rigor');
    expect(toast.error).toHaveBeenCalledWith('No se pudo registrar la observación', mensaje);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('un 400 con fieldErrors de descripcion lo pinta en el campo y no cierra', async () => {
    // Arrange
    const mensaje = 'La descripción no es válida.';
    mockMutacion(
      errorQueRespondeCon({
        status: 400,
        message: 'Validación fallida',
        fieldErrors: [{ field: 'descripcion', message: mensaje }],
      }),
    );
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.type(screen.getByLabelText(CAMPO), 'Falta rigor');
    await user.click(screen.getByRole('button', { name: BOTON }));

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText(CAMPO)).toHaveAccessibleDescription(
        expect.stringContaining(mensaje),
      ),
    );
    expect(toast.error).toHaveBeenCalled();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante evaluación finalizada lanza toast.error con el mensaje del servidor y cierra', async () => {
    // Arrange
    const mensaje = 'La evaluación ya fue finalizada.';
    mockMutacion(
      errorQueRespondeCon({
        status: 422,
        errorCode: 'EVALUACION_ESTADO_FINALIZADA',
        message: mensaje,
      }),
    );
    const user = userEvent.setup();
    const { onCerrar } = montar();

    // Act
    await user.type(screen.getByLabelText(CAMPO), 'Falta rigor');
    await user.click(screen.getByRole('button', { name: BOTON }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo registrar la observación', mensaje);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
