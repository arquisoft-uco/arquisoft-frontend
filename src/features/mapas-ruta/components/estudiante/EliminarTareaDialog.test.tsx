import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarTarea } from '../../hooks/useEliminarTarea';
import type { Tarea } from '../../models/Tarea';
import EliminarTareaDialog from './EliminarTareaDialog';

vi.mock('../../hooks/useEliminarTarea', () => ({ useEliminarTarea: vi.fn() }));
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

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'crudo', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('EliminarTareaDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEliminarTarea).mockReturnValue({
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

  it('muestra los antecedentes de la tarea y la consecuencia irreversible', () => {
    // Arrange / Act
    render(<EliminarTareaDialog tarea={TAREA} onCerrar={vi.fn()} onEliminada={vi.fn()} />);

    // Assert
    expect(screen.getByText(/Entregar informe/)).toBeInTheDocument();
    expect(screen.getByText(/En progreso/)).toBeInTheDocument();
    expect(screen.getByText(/Ana Ruiz/)).toBeInTheDocument();
    expect(screen.getByText(/no se puede deshacer/)).toBeInTheDocument();
  });

  it('Cancelar cierra sin mutar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<EliminarTareaDialog tarea={TAREA} onCerrar={onCerrar} onEliminada={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar muta con el id, muestra el toast de éxito y avisa que fue eliminada', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEliminada = vi.fn();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_id: string, o: OpcionesMutate) => o.onSuccess());
    render(<EliminarTareaDialog tarea={TAREA} onCerrar={onCerrar} onEliminada={onEliminada} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar tarea' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('t-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Tarea eliminada');
    expect(onEliminada).toHaveBeenCalledTimes(1);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con error muestra el toast con el mensaje propio y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEliminada = vi.fn();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_id: string, o: OpcionesMutate) =>
      o.onError(errorApi('TAREA_NO_REMOVIBLE')),
    );
    render(<EliminarTareaDialog tarea={TAREA} onCerrar={onCerrar} onEliminada={onEliminada} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar tarea' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la tarea',
      expect.stringContaining('ya no se puede eliminar'),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onEliminada).not.toHaveBeenCalled();
  });
});
