import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import CambiarPuntajeEvaluacionCuantitativaAsesorPanel from './CambiarPuntajeEvaluacionCuantitativaAsesorPanel';
import { useCambiarPuntajeEvaluacionCuantitativaAsesor } from '../../hooks/useCambiarPuntajeEvaluacionCuantitativaAsesor';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';

vi.mock('../../hooks/useCambiarPuntajeEvaluacionCuantitativaAsesor', () => ({
  useCambiarPuntajeEvaluacionCuantitativaAsesor: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const FILA: EvaluacionCuantitativaAsesor = {
  id: 'ec-1',
  puntaje: 80,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: 'cat-1',
    valor: 100,
  },
};

type MutateOptions = { onSuccess?: () => void; onError?: (err: unknown) => void };

function mockMutacion() {
  const mutate = vi.fn();
  vi.mocked(useCambiarPuntajeEvaluacionCuantitativaAsesor).mockReturnValue({
    isPending: false,
    mutate,
    reset: vi.fn(),
  } as never);
  return mutate;
}

function errorApi(errorCode: string, message = 'Mensaje del backend', fieldErrors?: unknown) {
  const status = fieldErrors ? 400 : 422;
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status, fieldErrors },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function escribirYGuardar(user: ReturnType<typeof userEvent.setup>, puntaje: string) {
  const campo = screen.getByRole('textbox', { name: /Puntaje/ });
  await user.clear(campo);
  await user.type(campo, puntaje);
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
}

describe('CambiarPuntajeEvaluacionCuantitativaAsesorPanel', () => {
  const onCerrar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function montar() {
    return render(
      <CambiarPuntajeEvaluacionCuantitativaAsesorPanel
        fila={FILA}
        evaluacionAsesorId="ea-1"
        onCerrar={onCerrar}
      />,
    );
  }

  it('muestra el puntaje actual y deja «Guardar cambios» deshabilitado hasta editarlo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion();
    montar();

    // Assert
    expect(screen.getByRole('textbox', { name: /Puntaje/ })).toHaveValue('80');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();

    // Act
    await user.type(screen.getByRole('textbox', { name: /Puntaje/ }), '1');

    // Assert
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  });

  it('un puntaje mayor que el valor del ítem muestra el error y no envía', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    montar();

    // Act
    await escribirYGuardar(user, '101');

    // Assert
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Debe estar entre 0 y 100').length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía el id de la fila y el puntaje numérico; en éxito avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) => opciones.onSuccess?.());
    montar();

    // Act
    await escribirYGuardar(user, '60');

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { evaluacionCuantitativaAsesorId: 'ec-1', puntaje: 60 },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Puntaje cambiado', expect.any(String));
    expect(onCerrar).toHaveBeenCalled();
  });

  it.each([
    'EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA',
    'EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA',
  ])('con el 422 %s avisa y cierra el panel', async (codigo) => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(errorApi(codigo)),
    );
    montar();

    // Act
    await escribirYGuardar(user, '60');

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar el puntaje', expect.any(String));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('pinta bajo el campo el error de backend sobre «puntaje» y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(
        errorApi('VALIDACION', 'Inválido', [{ field: 'puntaje', message: 'Puntaje rechazado' }]),
      ),
    );
    montar();

    // Act
    await escribirYGuardar(user, '60');

    // Assert
    expect(toast.error).toHaveBeenCalled();
    expect((await screen.findAllByText('Puntaje rechazado')).length).toBeGreaterThan(0);
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
