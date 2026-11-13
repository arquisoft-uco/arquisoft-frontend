import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useAportarPlanReal } from '../../hooks/useAportarPlanReal';
import AportarPlanRealPanel from './AportarPlanRealPanel';

vi.mock('../../hooks/useAportarPlanReal', () => ({ useAportarPlanReal: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();

const PLAN = {
  id: 'r-1',
  tareaId: 't-1',
  descripcionTarea: 'Entregar informe',
  tiempoRealDias: 5,
  descripcionReal: 'Redacción',
};

function errorApi(status: number, data: Record<string, unknown>) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, ...data },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const campo = () => screen.getByRole('textbox', { name: /Descripción/ });
const guardar = () => screen.getByRole('button', { name: 'Guardar aporte' });

function renderPanel(onCerrar = vi.fn()) {
  render(<AportarPlanRealPanel proyectoGradoId="pg-1" plan={PLAN} onCerrar={onCerrar} />);
  return onCerrar;
}

describe('AportarPlanRealPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAportarPlanReal).mockReturnValue({
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

  it('precarga la descripción, muestra tarea, días y aviso de reemplazo', () => {
    // Act
    renderPanel();

    // Assert
    expect(campo()).toHaveValue('Redacción');
    expect(campo()).toHaveAttribute('maxLength', '200');
    expect(screen.getByText('Entregar informe')).toBeInTheDocument();
    expect(screen.getByText('5 días')).toBeInTheDocument();
    expect(
      screen.getByText('El aporte reemplaza la descripción del plan; los días reales no cambian.'),
    ).toBeInTheDocument();
  });

  it('con el campo en blanco muestra el error y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    renderPanel();

    // Act
    await user.clear(campo());
    await user.type(campo(), '   ');
    await user.click(guardar());

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('envía el id del plan y la descripción recortada, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    const onCerrar = renderPanel();

    // Act
    await user.clear(campo());
    await user.type(campo(), '  Nueva  ');
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { planRealId: 'r-1', req: { descripcionReal: 'Nueva' } },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Aporte registrado', expect.any(String));
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
    const onCerrar = renderPanel();

    // Act
    await user.type(campo(), ' más');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(campo()).toHaveAccessibleDescription(/Texto inválido/);
    expect(campo()).toHaveValue('Redacción más');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con PLAN_REAL_NO_ENCONTRADO avisa con toast y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi(422, { errorCode: 'PLAN_REAL_NO_ENCONTRADO', message: 'crudo' })),
    );
    const onCerrar = renderPanel();

    // Act
    await user.type(campo(), ' más');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('"Cerrar" sin cambios cierra sin llamar a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = renderPanel();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
