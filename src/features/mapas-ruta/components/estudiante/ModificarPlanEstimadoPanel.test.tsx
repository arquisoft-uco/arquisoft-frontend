import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useModificarPlanEstimado } from '../../hooks/useModificarPlanEstimado';
import ModificarPlanEstimadoPanel from './ModificarPlanEstimadoPanel';

vi.mock('../../hooks/useModificarPlanEstimado', () => ({ useModificarPlanEstimado: vi.fn() }));
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
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

const PLAN = {
  id: 'p-1',
  tareaId: 't-1',
  tiempoEstimadoDias: 5,
  descripcionEstimado: 'Redacción',
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
const guardar = () => screen.getByRole('button', { name: 'Guardar cambios' });

describe('ModificarPlanEstimadoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModificarPlanEstimado).mockReturnValue({
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

  it('precarga la descripción, muestra los días de solo lectura y deshabilita guardar sin cambios', () => {
    // Act
    render(<ModificarPlanEstimadoPanel tarea={TAREA} plan={PLAN} onCerrar={vi.fn()} />);

    // Assert
    expect(campo()).toHaveValue('Redacción');
    expect(screen.getByText('5 días')).toBeInTheDocument();
    expect(guardar()).toBeDisabled();
    expect(campo()).toHaveAttribute('maxLength', '200');
  });

  it('envía el id del plan y la descripción recortada, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    render(<ModificarPlanEstimadoPanel tarea={TAREA} plan={PLAN} onCerrar={onCerrar} />);

    // Act
    await user.clear(campo());
    await user.type(campo(), '  Nueva  ');
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { planEstimadoId: 'p-1', tareaId: 't-1', req: { descripcionEstimado: 'Nueva' } },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Plan estimado actualizado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('vaciar la descripción envía cadena vacía', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarPlanEstimadoPanel tarea={TAREA} plan={PLAN} onCerrar={vi.fn()} />);

    // Act
    await user.clear(campo());
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { planEstimadoId: 'p-1', tareaId: 't-1', req: { descripcionEstimado: '' } },
      expect.any(Object),
    );
  });

  it('con PLAN_ESTIMADO_NO_ENCONTRADO avisa con toast y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi(422, { errorCode: 'PLAN_ESTIMADO_NO_ENCONTRADO', message: 'crudo' })),
    );
    render(<ModificarPlanEstimadoPanel tarea={TAREA} plan={PLAN} onCerrar={onCerrar} />);

    // Act
    await user.type(campo(), ' más');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con fieldError 400 lo pinta bajo el campo, avisa y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(
        errorApi(400, {
          error: 'Bad Request',
          message: 'Datos inválidos',
          fieldErrors: [{ field: 'descripcionEstimado', message: 'Texto inválido' }],
        }),
      ),
    );
    render(<ModificarPlanEstimadoPanel tarea={TAREA} plan={PLAN} onCerrar={onCerrar} />);

    // Act
    await user.type(campo(), ' más');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(campo()).toHaveAccessibleDescription(/Texto inválido/);
    expect(campo()).toHaveValue('Redacción más');
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
