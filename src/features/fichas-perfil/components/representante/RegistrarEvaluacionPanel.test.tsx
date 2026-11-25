import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import { useEvaluacionFicha } from '../../hooks/useEvaluacionFicha';
import { useResumenFichaRepresentante } from '../../hooks/useResumenFichaRepresentante';
import { useRegistrarEvaluacion } from '../../hooks/useRegistrarEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import RegistrarEvaluacionPanel from './RegistrarEvaluacionPanel';

vi.mock('../../hooks/useEvaluacionFicha', () => ({ useEvaluacionFicha: vi.fn() }));
vi.mock('../../hooks/useResumenFichaRepresentante', () => ({
  useResumenFichaRepresentante: vi.fn(),
}));
vi.mock('../../hooks/useRegistrarEvaluacion', () => ({ useRegistrarEvaluacion: vi.fn() }));
vi.mock('../../hooks/useDescartarEvaluacion', () => ({
  useDescartarEvaluacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('./AsistenteEvaluacion', () => ({
  default: ({
    evaluacion,
    onVerObservaciones,
    accionTarjeta,
  }: {
    evaluacion: { id: string };
    onVerObservaciones: () => void;
    accionTarjeta?: ReactNode;
  }) => (
    <div>
      <p>Asistente de {evaluacion.id}</p>
      {accionTarjeta}
      <button type="button" onClick={onVerObservaciones}>
        Ver observaciones
      </button>
    </div>
  ),
}));
vi.mock('./EstadosEvaluacionPanel', () => ({ default: () => <div>Catálogo de estados</div> }));
vi.mock('./ObservacionesEvaluacionRepresentantePanel', () => ({
  default: ({
    evaluacion,
    fichaDisponible,
  }: {
    evaluacion: { id: string };
    fichaDisponible: boolean;
  }) => (
    <div>
      Observaciones de {evaluacion.id} {fichaDisponible ? 'editables' : 'de solo lectura'}
    </div>
  ),
}));

const consulta = vi.mocked(useEvaluacionFicha);
const registro = vi.mocked(useRegistrarEvaluacion);

function mockConsulta(parcial: {
  data?: EvaluacionFichaPerfil[];
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
}) {
  consulta.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEvaluacionFicha>);
}

const antigua: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-01',
  estadoEvaluacionId: 'APROBADA',
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
    vi.mocked(useResumenFichaRepresentante).mockReturnValue({
      resumen: { estadoId: 'DISPONIBLE_PARA_EVALUACION' },
      search: '',
    } as ReturnType<typeof useResumenFichaRepresentante>);
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
    expect(screen.getByRole('status')).toHaveTextContent('Cargando evaluación…');
  });

  it('muestra un alert cuando la consulta falla y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockConsulta({ isError: true, refetch });
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar la evaluación');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado vacío con el botón Iniciar evaluación cuando no hay evaluaciones', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Aún no se ha iniciado la evaluación')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar evaluación' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con la última evaluación abierta monta el asistente y deja las anteriores aparte', () => {
    // Arrange
    mockConsulta({ data: [antigua, reciente] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Asistente de ev-2')).toBeInTheDocument();
    expect(screen.queryByText('Asistente de ev-1')).not.toBeInTheDocument();
    expect(screen.getByText('Evaluaciones anteriores')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('con la última evaluación en estado final muestra el resultado y no el asistente', () => {
    // Arrange
    mockConsulta({ data: [antigua] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Evaluación registrada')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.queryByText(/Asistente de/)).not.toBeInTheDocument();
  });

  it('«Ver observaciones» de la vigente abre el panel con esa evaluación', async () => {
    // Arrange
    const user = userEvent.setup();
    mockConsulta({ data: [reciente] });
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver observaciones' }));

    // Assert
    expect(screen.getByText('Observaciones de ev-2 editables')).toBeInTheDocument();
    expect(screen.queryByText('Evaluaciones anteriores')).not.toBeInTheDocument();
  });

  it('lista las anteriores más reciente primero y su botón abre el panel de la suya', async () => {
    // Arrange
    const user = userEvent.setup();
    const intermedia: EvaluacionFichaPerfil = {
      ...antigua,
      id: 'ev-0',
      fechaCreacion: '2026-09-01',
    };
    mockConsulta({ data: [intermedia, antigua, reciente] });
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    const botones = screen.getAllByRole('button', { name: 'Ver observaciones' });
    await user.click(botones[2]);

    // Assert
    expect(screen.getByText('Evaluaciones anteriores')).toBeInTheDocument();
    expect(botones).toHaveLength(3);
    expect(screen.getByText('Observaciones de ev-0 editables')).toBeInTheDocument();
  });

  it('al confirmar el inicio lanza el toast de éxito y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_vars: unknown, opciones?: { onSuccess?: () => void }) =>
      opciones?.onSuccess?.(),
    );
    registro.mockReturnValue({ ...registro('f-1'), mutate } as never);
    mockConsulta({ data: [] });
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Iniciar evaluación' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar evaluación' }),
    );

    // Assert
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Evaluación iniciada',
      'Se registró la evaluación de la ficha.',
    );
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
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar evaluación' }),
    );

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al iniciar la evaluación', expect.any(String));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  function simularFicha(estadoId: string) {
    vi.mocked(useResumenFichaRepresentante).mockReturnValue({
      resumen: { estadoId },
      search: '',
    } as ReturnType<typeof useResumenFichaRepresentante>);
  }

  const descartada: EvaluacionFichaPerfil = {
    ...reciente,
    estadoEvaluacionId: 'DESCARTADA',
    estadoEvaluacionNombre: 'Descartada',
  };

  it('con la evaluación descartada y la ficha disponible muestra la tarjeta con «Reanudar evaluación» y sin asistente', () => {
    // Arrange
    mockConsulta({ data: [descartada] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Evaluación descartada')).toBeInTheDocument();
    expect(screen.getByText('No cuenta para la decisión del coordinador.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reanudar evaluación' })).toBeEnabled();
    expect(screen.queryByText(/Asistente de/)).not.toBeInTheDocument();
  });

  it('con la evaluación descartada y la ficha no disponible avisa sin ofrecer acciones', () => {
    // Arrange
    simularFicha('EN_REVISION');
    mockConsulta({ data: [descartada] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText(/ya no está disponible para evaluación/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reanudar evaluación' })).not.toBeInTheDocument();
  });

  it('con la evaluación en curso ofrece «Descartar evaluación» en la tarjeta solo si la ficha está disponible', () => {
    // Arrange
    mockConsulta({ data: [reciente] });

    // Act
    const disponible = render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('button', { name: 'Descartar evaluación' })).toBeEnabled();
    disponible.unmount();

    // Arrange
    simularFicha('EN_REVISION');

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText(/queda en solo lectura/)).toBeInTheDocument();
    expect(screen.queryByText(/Asistente de/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descartar evaluación' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver observaciones' })).toBeInTheDocument();
  });

  it('con la evaluación finalizada y la ficha no disponible queda en solo lectura', () => {
    // Arrange
    simularFicha('APROBADA');
    mockConsulta({ data: [antigua] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Evaluación registrada')).toBeInTheDocument();
    expect(screen.getByText(/queda en solo lectura/)).toBeInTheDocument();
    expect(screen.queryByText(/Asistente de/)).not.toBeInTheDocument();
  });

  it('sin evaluación y con la ficha no disponible explica el motivo y no ofrece «Iniciar evaluación»', () => {
    // Arrange
    simularFicha('EN_REVISION');
    mockConsulta({ data: [] });

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText(/no está disponible para evaluación/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Iniciar evaluación' })).not.toBeInTheDocument();
  });
});
