import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useModificarPlanReal } from '../../hooks/useModificarPlanReal';
import ModificarPlanRealPanel from './ModificarPlanRealPanel';

vi.mock('../../hooks/useModificarPlanReal', () => ({ useModificarPlanReal: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();

const TAREA = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'FINALIZADA', nombre: 'Finalizada' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

const PLAN = { id: 'r-1', tareaId: 't-1', tiempoRealDias: 4, descripcionReal: 'Informe entregado' };

function errorApi(status: number, data: Record<string, unknown>) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, ...data },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const dias = () => screen.getByRole('textbox', { name: /Días reales/ });
const descripcion = () => screen.getByRole('textbox', { name: /Descripción/ });
const guardar = () => screen.getByRole('button', { name: 'Guardar cambios' });

function abrir(onCerrar = vi.fn()) {
  render(<ModificarPlanRealPanel tarea={TAREA} plan={PLAN} onCerrar={onCerrar} />);
  return onCerrar;
}

describe('ModificarPlanRealPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModificarPlanReal).mockReturnValue({
      mutate,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      data: undefined,
      error: null,
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      isError: false,
      isIdle: true,
      isPaused: false,
      isPending: false,
      isSuccess: false,
      status: 'idle',
    });
  });

  it('precarga días y descripción, avisa del recálculo y deshabilita guardar sin cambios', () => {
    // Act
    abrir();

    // Assert
    expect(dias()).toHaveValue('4');
    expect(descripcion()).toHaveValue('Informe entregado');
    expect(descripcion()).toHaveAttribute('maxLength', '200');
    expect(screen.getByText(/el sistema recalcula el plan real/)).toBeInTheDocument();
    expect(guardar()).toBeDisabled();
  });

  it('con días inválidos muestra el error y el resumen, y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    abrir();

    // Act
    await user.clear(dias());
    await user.type(dias(), '0');
    await user.click(guardar());

    // Assert
    expect(dias()).toHaveAccessibleDescription(/mayor o igual a 1/);
    expect(await screen.findByRole('button', { name: /^Días reales:/ })).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía los días como número, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    const onCerrar = abrir();

    // Act
    await user.clear(dias());
    await user.type(dias(), '7');
    await user.clear(descripcion());
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { planRealId: 'r-1', tareaId: 't-1', req: { tiempoRealDias: 7, descripcionReal: '' } },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Plan real actualizado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con PLAN_REAL_NO_ENCONTRADO avisa con toast y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi(422, { errorCode: 'PLAN_REAL_NO_ENCONTRADO', message: 'crudo' })),
    );
    const onCerrar = abrir();

    // Act
    await user.type(dias(), '0');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con fieldError 400 lo pinta bajo el campo, avisa y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(
        errorApi(400, {
          error: 'Bad Request',
          message: 'Datos inválidos',
          fieldErrors: [{ field: 'descripcionReal', message: 'Texto inválido' }],
        }),
      ),
    );
    const onCerrar = abrir();

    // Act
    await user.type(descripcion(), ' más');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(descripcion()).toHaveAccessibleDescription(/Texto inválido/);
    expect(descripcion()).toHaveValue('Informe entregado más');
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
