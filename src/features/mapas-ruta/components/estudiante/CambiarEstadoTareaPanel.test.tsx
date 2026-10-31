import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useCambiarEstadoTarea } from '../../hooks/useCambiarEstadoTarea';
import { useEstadosTarea } from '../../hooks/useEstadosTarea';
import type { Tarea } from '../../models/Tarea';
import CambiarEstadoTareaPanel from './CambiarEstadoTareaPanel';

vi.mock('../../hooks/useEstadosTarea', () => ({ useEstadosTarea: vi.fn() }));
vi.mock('../../hooks/useCambiarEstadoTarea', () => ({ useCambiarEstadoTarea: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();
const refetch = vi.fn();

const CATALOGO = [
  { id: 'NUEVA', nombre: 'Nueva', descripcion: 'Sin iniciar' },
  { id: 'EN_PROGRESO', nombre: 'En progreso', descripcion: 'Se está trabajando' },
  { id: 'FINALIZADA', nombre: 'Finalizada', descripcion: 'Terminada' },
];

const TAREA: Tarea = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

function simularCatalogo(parcial: Partial<ReturnType<typeof useEstadosTarea>> = {}) {
  vi.mocked(useEstadosTarea).mockReturnValue({
    data: CATALOGO,
    isLoading: false,
    isError: false,
    refetch,
    ...parcial,
  } as ReturnType<typeof useEstadosTarea>);
}

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'crudo', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('CambiarEstadoTareaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularCatalogo();
    vi.mocked(useCambiarEstadoTarea).mockReturnValue({
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

  it('ofrece solo los destinos permitidos con nombre y descripción, y no envía sin elegir', () => {
    // Arrange / Act
    render(<CambiarEstadoTareaPanel tarea={TAREA} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('radio', { name: /En progreso/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Finalizada/ })).toBeInTheDocument();
    expect(screen.getByText('Se está trabajando')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Cambiar estado' })).toBeDisabled();
  });

  it('al enviar llama a la mutación, muestra el toast de éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    render(<CambiarEstadoTareaPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('radio', { name: /En progreso/ }));
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { tareaId: 't-1', req: { estadoItemId: 'EN_PROGRESO' } },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Estado actualizado',
      expect.stringContaining('En progreso'),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con error de transición muestra el toast de error y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('TRANSICION_ESTADO_ITEM_NO_PERMITIDA')),
    );
    render(<CambiarEstadoTareaPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('radio', { name: /Finalizada/ }));
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cambiar el estado',
      expect.stringContaining('ya no admite ese cambio'),
    );
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con tarea no encontrada muestra el toast de error y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('TAREA_NO_ENCONTRADA')),
    );
    render(<CambiarEstadoTareaPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('radio', { name: /Finalizada/ }));
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con error del catálogo muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    simularCatalogo({ data: undefined, isError: true });
    const user = userEvent.setup();
    render(<CambiarEstadoTareaPanel tarea={TAREA} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByText('No pudimos cargar los estados')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});
