import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import type { EstadoEvaluacion } from '../../models/fichas-perfil';
import { fichasPerfilService } from '../../services/fichasPerfilService';
import EstadosEvaluacionPanel from './EstadosEvaluacionPanel';

vi.mock('../../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEstadosEvaluacion: vi.fn(),
  },
}));

const getEstadosEvaluacion = vi.mocked(fichasPerfilService.getEstadosEvaluacion);

const ESTADOS: EstadoEvaluacion[] = [
  { id: 'ev-1', nombre: 'En Evaluación', descripcion: 'Evaluación en curso' },
  { id: 'ev-2', nombre: 'Aprobada', descripcion: 'Ficha aprobada sin cambios' },
  { id: 'ev-3', nombre: 'No Aprobada', descripcion: 'Ficha rechazada por el comité' },
];

describe('EstadosEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga, marca el contenedor como ocupado y no muestra la lista', () => {
    // Arrange
    getEstadosEvaluacion.mockReturnValue(new Promise(() => {}));

    // Act
    const { container } = render(<EstadosEvaluacionPanel />);

    // Assert
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByText('Estados disponibles')).not.toBeInTheDocument();
  });

  it('muestra una alerta accionable cuando la consulta falla', async () => {
    // Arrange
    getEstadosEvaluacion.mockRejectedValue(new Error('fallo de red'));

    // Act
    render(<EstadosEvaluacionPanel />);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los estados de evaluación. Intenta nuevamente.',
    );
  });

  it('lista cada estado con su nombre y descripción bajo el título', async () => {
    // Arrange
    getEstadosEvaluacion.mockResolvedValue(ESTADOS);

    // Act
    render(<EstadosEvaluacionPanel />);

    // Assert
    expect(await screen.findByText('Estados disponibles')).toBeInTheDocument();
    for (const estado of ESTADOS) {
      expect(screen.getByText(estado.nombre)).toBeInTheDocument();
      expect(screen.getByText(estado.descripcion)).toBeInTheDocument();
    }
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
