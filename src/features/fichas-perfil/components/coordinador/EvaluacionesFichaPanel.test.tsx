import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EvaluacionesFichaPanel from './EvaluacionesFichaPanel';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import type { EvaluacionFichaPerfilEstudiante } from '../../models/EvaluacionFichaPerfilEstudiante';

vi.mock('../../hooks/useEvaluacionesFichaCoordinador', () => ({
  useEvaluacionesFichaCoordinador: vi.fn(),
}));

vi.mock('./ObservacionesEvaluacionCoordinadorPanel', () => ({
  default: ({ evaluacion }: { evaluacion: { id: string } }) => (
    <div role="dialog" aria-label={`Observaciones de ${evaluacion.id}`} />
  ),
}));

const APROBADA: EvaluacionFichaPerfilEstudiante = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-09-01T10:00:00',
  estadoEvaluacionId: 'APROBADA',
  estadoEvaluacionNombre: 'Aprobada',
  representante: { id: 'r-1', nombre: 'Rosa Gil' },
};
const SIN_ESTADO: EvaluacionFichaPerfilEstudiante = {
  id: 'ev-2',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-09-02T10:00:00',
  estadoEvaluacionId: null,
  estadoEvaluacionNombre: null,
  representante: { id: 'r-2', nombre: 'Luis Mora' },
};

type ResultadoConsulta = ReturnType<typeof useEvaluacionesFichaCoordinador>;

function mockConsulta(parcial: Partial<ResultadoConsulta> = {}) {
  vi.mocked(useEvaluacionesFichaCoordinador).mockReturnValue({
    data: [APROBADA, SIN_ESTADO],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as ResultadoConsulta);
}

describe('EvaluacionesFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsulta();
  });

  it('muestra el total y cada evaluación con su estado y representante', () => {
    // Act
    render(<EvaluacionesFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('2 evaluaciones')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.getByText('Sin estado')).toBeInTheDocument();
    expect(screen.getByText('Evaluada por Rosa Gil')).toBeInTheDocument();
    expect(screen.getByText('Evaluada por Luis Mora')).toBeInTheDocument();
  });

  it('con una sola evaluación usa el singular', () => {
    // Arrange
    mockConsulta({ data: [APROBADA] });

    // Act
    render(<EvaluacionesFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('1 evaluación')).toBeInTheDocument();
  });

  it('muestra un estado de carga accesible mientras llegan las evaluaciones', () => {
    // Arrange
    mockConsulta({ data: undefined, isLoading: true });

    // Act
    render(<EvaluacionesFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando evaluaciones…');
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockConsulta({ data: undefined, isError: true, refetch });
    render(<EvaluacionesFichaPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las evaluaciones');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin evaluaciones muestra el vacío y no un error', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<EvaluacionesFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene evaluaciones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('cada tarjeta tiene «Ver observaciones» y al pulsarlo abre el panel de esa evaluación', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EvaluacionesFichaPanel fichaPerfilId="f-1" />);
    const botones = screen.getAllByRole('button', { name: 'Ver observaciones' });

    // Act
    await user.click(botones[1]);

    // Assert
    expect(botones).toHaveLength(2);
    expect(screen.getByRole('dialog', { name: 'Observaciones de ev-2' })).toBeInTheDocument();
  });
});
