import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EditarObservacionEvaluacionForm from './EditarObservacionEvaluacionForm';
import { useModificarObservacionEvaluacion } from '../../hooks/useModificarObservacionEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import { errorApi } from '../../../../test-utils/errores-api';

vi.mock('../../hooks/useModificarObservacionEvaluacion', () => ({
  useModificarObservacionEvaluacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Resultado = ReturnType<typeof useModificarObservacionEvaluacion>;
type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

const OBSERVACION: ObservacionEvaluacion = {
  id: 'o-1',
  evaluacionFichaPerfilId: 'ev-1',
  observacion: 'Ajustar el alcance',
};

function mockHook(mutate = vi.fn()) {
  const reset = vi.fn();
  const resultado: Partial<Record<keyof Resultado, unknown>> = { mutate, reset, isPending: false };
  vi.mocked(useModificarObservacionEvaluacion).mockReturnValue(resultado as Resultado);
  return { mutate, reset };
}

function montar(onCerrar = vi.fn()) {
  render(
    <EditarObservacionEvaluacionForm
      observacion={OBSERVACION}
      fichaPerfilId="f-1"
      onCerrar={onCerrar}
    />,
  );
}

const guardar = () => screen.getByRole('button', { name: 'Guardar cambios' });
const campo = () => screen.getByRole('textbox', { name: 'Observación' });

describe('EditarObservacionEvaluacionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre con el texto actual y no deja guardar mientras no haya cambios', () => {
    // Arrange
    mockHook();

    // Act
    montar();

    // Assert
    expect(screen.getByRole('dialog', { name: 'Editar observación' })).toBeInTheDocument();
    expect(campo()).toHaveValue('Ajustar el alcance');
    expect(guardar()).toBeDisabled();
  });

  it('guarda el nuevo texto, avisa del éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate } = mockHook(vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.()));
    montar(onCerrar);

    // Act
    await user.type(campo(), ' y la metodología');
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { observacionEvaluacionId: 'o-1', observacion: 'Ajustar el alcance y la metodología' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Observación actualizada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con el texto vacío pinta el error y no envía', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    montar();

    // Act
    await user.clear(campo());
    await user.tab();
    await user.click(guardar());

    // Assert
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante un 422 genérico da toast y deja el formulario abierto con el texto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(errorApi(422, { message: 'La evaluación está cerrada.' })),
      ),
    );
    montar(onCerrar);

    // Act
    await user.type(campo(), ' x');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo actualizar la observación',
      'La evaluación está cerrada.',
    );
    expect(campo()).toHaveValue('Ajustar el alcance x');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante OBSERVACION_EVALUACION_DUPLICADA también pinta el mensaje bajo el campo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, {
            errorCode: 'OBSERVACION_EVALUACION_DUPLICADA',
            message: 'Ya existe esa observación.',
          }),
        ),
      ),
    );
    montar();

    // Act
    await user.type(campo(), ' x');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo actualizar la observación',
      'Ya existe esa observación.',
    );
    expect(await screen.findAllByText('Ya existe esa observación.')).not.toHaveLength(0);
  });

  it('cerrar sin cambios reinicia la mutación y cierra; con cambios pide confirmar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { reset } = mockHook();
    montar(onCerrar);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);

    // Act
    await user.type(campo(), '!');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText('¿Descartar los cambios?')).toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
