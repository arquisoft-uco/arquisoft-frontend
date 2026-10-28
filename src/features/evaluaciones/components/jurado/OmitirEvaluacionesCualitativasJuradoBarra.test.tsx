import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import OmitirEvaluacionesCualitativasJuradoBarra from './OmitirEvaluacionesCualitativasJuradoBarra';
import { useOmitirEvaluacionesCualitativasJurado } from '../../hooks/useOmitirEvaluacionesCualitativasJurado';
import { toast } from '../../../../shared/hooks/useToast';

vi.mock('../../hooks/useOmitirEvaluacionesCualitativasJurado', () => ({
  useOmitirEvaluacionesCualitativasJurado: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

function crearErrorApi(errorCode: string, status = 422) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function mockMutacion(mutate = vi.fn()) {
  vi.mocked(useOmitirEvaluacionesCualitativasJurado).mockReturnValue({
    isPending: false,
    mutate,
  } as Partial<ReturnType<typeof useOmitirEvaluacionesCualitativasJurado>> as ReturnType<
    typeof useOmitirEvaluacionesCualitativasJurado
  >);
  return mutate;
}

function montar(seleccionadas: string[]) {
  const onSeleccionarTodas = vi.fn();
  const onLimpiarSeleccion = vi.fn();
  render(
    <OmitirEvaluacionesCualitativasJuradoBarra
      evaluacionJuradoId="ej-1"
      idsTodas={['ec-1', 'ec-2']}
      seleccionadas={seleccionadas}
      onSeleccionarTodas={onSeleccionarTodas}
      onLimpiarSeleccion={onLimpiarSeleccion}
    />,
  );
  return { onSeleccionarTodas, onLimpiarSeleccion };
}

describe('OmitirEvaluacionesCualitativasJuradoBarra', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutacion();
  });

  it('deshabilita «Omitir (0)» sin selección y «Seleccionar todas» selecciona todas', async () => {
    // Arrange
    const { onSeleccionarTodas } = montar([]);

    // Act
    await userEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar todas' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Omitir (0)' })).toBeDisabled();
    expect(onSeleccionarTodas).toHaveBeenCalledTimes(1);
  });

  it('con todas marcadas, «Seleccionar todas» está marcada y al alternarla limpia la selección', async () => {
    // Arrange
    const { onLimpiarSeleccion } = montar(['ec-1', 'ec-2']);
    const casilla = screen.getByRole('checkbox', { name: 'Seleccionar todas' });

    // Act
    await userEvent.click(casilla);

    // Assert
    expect(casilla).toBeChecked();
    expect(onLimpiarSeleccion).toHaveBeenCalledTimes(1);
  });

  it('con selección abre el diálogo con el conteo y «Cancelar» no llama a la mutación', async () => {
    // Arrange
    const mutate = mockMutacion();
    montar(['ec-1']);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Omitir (1)' }));

    // Assert
    expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Omitir 1 evaluación cualitativa?');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar envía los ids exactos, muestra el toast de éxito y limpia la selección', async () => {
    // Arrange
    const mutate = mockMutacion(
      vi.fn((_ids: string[], opciones?: MutateOptions) => opciones?.onSuccess?.()),
    );
    const { onLimpiarSeleccion } = montar(['ec-1', 'ec-2']);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Omitir (2)' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      '¿Omitir 2 evaluaciones cualitativas?',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Omitir' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(['ec-1', 'ec-2'], expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Evaluaciones omitidas', expect.any(String));
    expect(onLimpiarSeleccion).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('ante «valoraciones no encontradas» muestra su mensaje y limpia la selección', async () => {
    // Arrange
    mockMutacion(
      vi.fn((_ids: string[], opciones?: MutateOptions) =>
        opciones?.onError?.(
          crearErrorApi('EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS'),
        ),
      ),
    );
    const { onLimpiarSeleccion } = montar(['ec-1']);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Omitir (1)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Omitir' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo omitir',
      'Algunas valoraciones ya no existen. Actualizamos la lista.',
    );
    expect(onLimpiarSeleccion).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('con un error de servidor muestra el toast, cierra el diálogo y conserva la selección', async () => {
    // Arrange
    mockMutacion(
      vi.fn((_ids: string[], opciones?: MutateOptions) =>
        opciones?.onError?.(crearErrorApi('ERROR_INTERNO', 500)),
      ),
    );
    const { onLimpiarSeleccion } = montar(['ec-1']);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Omitir (1)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Omitir' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo omitir', expect.any(String));
    expect(onLimpiarSeleccion).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
