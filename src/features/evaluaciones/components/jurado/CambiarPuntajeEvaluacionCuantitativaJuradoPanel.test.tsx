import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import CambiarPuntajeEvaluacionCuantitativaJuradoPanel from './CambiarPuntajeEvaluacionCuantitativaJuradoPanel';
import { useCambiarPuntajeEvaluacionCuantitativaJurado } from '../../hooks/useCambiarPuntajeEvaluacionCuantitativaJurado';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';

vi.mock('../../hooks/useCambiarPuntajeEvaluacionCuantitativaJurado', () => ({
  useCambiarPuntajeEvaluacionCuantitativaJurado: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const FILA: EvaluacionCuantitativaJurado = {
  id: 'eq-1',
  puntaje: 40,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: 'c-1',
    valor: 50,
  },
};

type MutateOptions = { onSuccess?: () => void; onError?: (err: unknown) => void };

function mockMutacion() {
  const mutate = vi.fn();
  vi.mocked(useCambiarPuntajeEvaluacionCuantitativaJurado).mockReturnValue({
    isPending: false,
    mutate,
    reset: vi.fn(),
  } as never);
  return mutate;
}

function errorApi(errorCode: string, message = 'Mensaje del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function escribirYGuardar(user: ReturnType<typeof userEvent.setup>, texto: string) {
  const campo = screen.getByRole('textbox', { name: /Puntaje/ });
  await user.clear(campo);
  if (texto) await user.type(campo, texto);
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
}

describe('CambiarPuntajeEvaluacionCuantitativaJuradoPanel', () => {
  const onCerrar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function montar() {
    return render(
      <CambiarPuntajeEvaluacionCuantitativaJuradoPanel
        fila={FILA}
        evaluacionJuradoId="ej-1"
        onCerrar={onCerrar}
      />,
    );
  }

  it('parte con el puntaje actual y «Guardar cambios» inactivo hasta que cambie', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion();
    montar();

    // Assert
    expect(screen.getByRole('textbox', { name: /Puntaje/ })).toHaveValue('40');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();

    // Act
    await user.type(screen.getByRole('textbox', { name: /Puntaje/ }), '5');

    // Assert
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  });

  it.each([
    ['', 'Este campo es requerido'],
    ['4.5', 'Solo se permiten dígitos'],
    ['51', 'Debe estar entre 0 y 50'],
  ])('con el puntaje «%s» muestra el error y no llama a la mutación', async (texto, mensaje) => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    montar();

    // Act
    await escribirYGuardar(user, texto);

    // Assert
    expect((await screen.findAllByText(mensaje)).length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía el puntaje como número; en éxito avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) => opciones.onSuccess?.());
    montar();

    // Act
    await escribirYGuardar(user, '25');

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { evaluacionCuantitativaJuradoId: 'eq-1', puntaje: 25 },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Puntaje cambiado', expect.any(String));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('con el 422 de tope excedido avisa, pinta el mensaje bajo el campo y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(errorApi('EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM')),
    );
    montar();

    // Act
    await escribirYGuardar(user, '50');

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cambiar el puntaje',
      'El puntaje supera el máximo del ítem.',
    );
    expect(
      (await screen.findAllByText('El puntaje supera el máximo del ítem.')).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: /Puntaje/ })).toHaveValue('50');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con el 422 de valoración inexistente avisa y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(errorApi('EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA')),
    );
    montar();

    // Act
    await escribirYGuardar(user, '25');

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cambiar el puntaje',
      'La valoración ya no existe. Actualiza la lista.',
    );
    expect(onCerrar).toHaveBeenCalled();
  });
});
