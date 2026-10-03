import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import { useEvaluacionFicha } from '../../hooks/useEvaluacionFicha';
import { useRegistrarEvaluacion } from '../../hooks/useRegistrarEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import RegistrarEvaluacionPanel from './RegistrarEvaluacionPanel';

vi.mock('../../hooks/useEvaluacionFicha', () => ({ useEvaluacionFicha: vi.fn() }));
vi.mock('../../hooks/useRegistrarEvaluacion', () => ({ useRegistrarEvaluacion: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('./AgregarEstadoEvaluacionPanel', () => ({
  default: ({ evaluacionId }: { evaluacionId: string }) => <div>Agregar estado a {evaluacionId}</div>,
}));
vi.mock('./EstadosEvaluacionPanel', () => ({ default: () => <div>Catálogo de estados</div> }));
vi.mock('./AgregarObservacionEvaluacionPanel', () => ({ default: () => <div>Agregar observación</div> }));

const consulta = vi.mocked(useEvaluacionFicha);
const registro = vi.mocked(useRegistrarEvaluacion);

function mockConsulta(parcial: { data?: EvaluacionFichaPerfil[]; isLoading?: boolean; isError?: boolean }) {
  consulta.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useEvaluacionFicha>);
}

const antigua: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-01',
  estadoEvaluacionId: 'st-1',
  estadoEvaluacionNombre: 'Aprobada',
};
const reciente: EvaluacionFichaPerfil = {
  id: 'ev-2',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-02',
  estadoEvaluacionId: null,
  estadoEvaluacionNombre: null,
};

describe('RegistrarEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registro.mockReturnValue({
      data: undefined,
      variables: undefined,
      error: null,
      isError: false,
      isIdle: true,
      isPending: false,
      isPaused: false,
      isSuccess: false,
      status: 'idle',
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    });
  });

  it('muestra el estado de carga con role status', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando evaluación...');
  });

  it('muestra un alert cuando la consulta falla', () => {
    // Arrange
    mockConsulta({ isError: true });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar la evaluación. Intenta nuevamente.',
    );
  });

  it('muestra el estado vacío con el botón Iniciar evaluación cuando no hay evaluaciones', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText(/Aún no se ha iniciado la evaluación/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar evaluación' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra los datos de la última evaluación y "Sin estado" cuando su nombre es null', () => {
    // Arrange
    mockConsulta({ data: [antigua, reciente] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('ev-2')).toBeInTheDocument();
    expect(screen.getByText(/2026-10-02/)).toBeInTheDocument();
    expect(screen.getByText('Sin estado')).toBeInTheDocument();
    expect(screen.getByText('Agregar estado a ev-2')).toBeInTheDocument();
    expect(screen.queryByText('ev-1')).not.toBeInTheDocument();
    expect(screen.queryByText('Aprobada')).not.toBeInTheDocument();
  });

  it('muestra el nombre del estado cuando la última evaluación lo tiene', () => {
    // Arrange
    mockConsulta({ data: [antigua] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('al confirmar el inicio lanza el toast de éxito y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_vars: unknown, opciones?: { onSuccess?: () => void }) => opciones?.onSuccess?.());
    registro.mockReturnValue({ ...registro('f-1'), mutate } as never);
    mockConsulta({ data: [] });
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Iniciar evaluación' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar evaluación' }));

    // Assert
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Evaluación iniciada', 'Se registró la evaluación de la ficha.');
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('si el registro falla lanza el toast de error y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_vars: unknown, opciones?: { onError?: (err: Error) => void }) =>
      opciones?.onError?.(new Error('Red caída')),
    );
    registro.mockReturnValue({ ...registro('f-1'), mutate } as never);
    mockConsulta({ data: [] });
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Iniciar evaluación' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar evaluación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al iniciar la evaluación', expect.any(String));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
