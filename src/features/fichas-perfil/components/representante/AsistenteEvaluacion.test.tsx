import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import { useObservacionesEvaluacionRepresentante } from '../../hooks/useObservacionesEvaluacionRepresentante';
import AsistenteEvaluacion from './AsistenteEvaluacion';

vi.mock('../../hooks/useObservacionesEvaluacionRepresentante', () => ({
  useObservacionesEvaluacionRepresentante: vi.fn(),
}));
vi.mock('./AgregarObservacionEvaluacionPanel', () => ({
  default: () => <div>Formulario de observación</div>,
}));
vi.mock('./AgregarEstadoEvaluacionPanel', () => ({
  default: ({
    cantidadObservaciones,
    onVolver,
  }: {
    cantidadObservaciones: number;
    onVolver: () => void;
  }) => (
    <div>
      <p>Paso de estado con {cantidadObservaciones} observaciones</p>
      <button type="button" onClick={onVolver}>
        Atrás
      </button>
    </div>
  ),
}));

const EVALUACION: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-01',
  estadoEvaluacionId: 'EN_EVALUACION',
  estadoEvaluacionNombre: 'En Evaluación',
};

function mockObservaciones(parcial: Record<string, unknown>) {
  vi.mocked(useObservacionesEvaluacionRepresentante).mockReturnValue({
    observaciones: [],
    isLoading: false,
    cargado: true,
    tieneDatos: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as never);
}

function renderizar() {
  render(
    <AsistenteEvaluacion
      evaluacion={EVALUACION}
      fichaPerfilId="f-1"
      onVerObservaciones={vi.fn()}
    />,
  );
}

describe('AsistenteEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra la tarjeta «Evaluación en curso» y arranca en el paso de observaciones', () => {
    // Arrange
    mockObservaciones({});

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Evaluación en curso')).toBeInTheDocument();
    expect(screen.getByText('¿Deseas agregar alguna observación?')).toBeInTheDocument();
    expect(screen.queryByText(/Paso de estado/)).not.toBeInTheDocument();
  });

  it('mientras cargan las observaciones muestra carga y no deja avanzar', () => {
    // Arrange
    mockObservaciones({ cargado: false, tieneDatos: false, isLoading: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando observaciones…');
    expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
  });

  it('si fallan las observaciones muestra el error y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockObservaciones({ cargado: false, tieneDatos: false, isError: true, refetch });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las observaciones');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('si falla una recarga con observaciones ya cargadas conserva el paso', () => {
    // Arrange
    mockObservaciones({ cargado: false, tieneDatos: true, isError: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('¿Deseas agregar alguna observación?')).toBeInTheDocument();
    expect(screen.queryByText('No se pudieron cargar las observaciones')).not.toBeInTheDocument();
  });

  it('elegir «No» y continuar pasa al estado con cero observaciones, y «Atrás» regresa', async () => {
    // Arrange
    const user = userEvent.setup();
    mockObservaciones({});
    renderizar();

    // Act
    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Assert
    expect(screen.getByText('Paso de estado con 0 observaciones')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Atrás' }));

    // Assert
    expect(screen.getByText('¿Deseas agregar alguna observación?')).toBeInTheDocument();
  });

  it('con una observación registrada el paso de estado recibe la cantidad', async () => {
    // Arrange
    const user = userEvent.setup();
    mockObservaciones({ observaciones: [{ id: 'o-1', observacion: 'Ajustar alcance' }] });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Assert
    expect(screen.getByText('Paso de estado con 1 observaciones')).toBeInTheDocument();
  });
});
