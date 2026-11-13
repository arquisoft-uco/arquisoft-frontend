import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarPlanReal } from '../../hooks/useEliminarPlanReal';
import type { Tarea } from '../../models/Tarea';
import EliminarPlanRealDialog from './EliminarPlanRealDialog';

vi.mock('../../hooks/useEliminarPlanReal', () => ({ useEliminarPlanReal: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();

const TAREA: Tarea = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'EN_PROGRESO', nombre: 'En progreso' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

const PLAN = {
  id: 'r-1',
  tareaId: 't-1',
  tiempoRealDias: 5,
  descripcionReal: 'Informe entregado',
};

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'crudo', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('EliminarPlanRealDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEliminarPlanReal).mockReturnValue({
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

  it('Cancelar cierra sin mutar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<EliminarPlanRealDialog tarea={TAREA} plan={PLAN} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar muta con plan y tarea, muestra el toast de éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    render(<EliminarPlanRealDialog tarea={TAREA} plan={PLAN} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover plan real' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith({ planRealId: 'r-1', tareaId: 't-1' }, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Plan real removido');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con error muestra el toast con el mensaje propio y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('PLAN_REAL_NO_ENCONTRADO')),
    );
    render(<EliminarPlanRealDialog tarea={TAREA} plan={PLAN} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover plan real' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo remover el plan real',
      expect.stringContaining('ya no está disponible'),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
