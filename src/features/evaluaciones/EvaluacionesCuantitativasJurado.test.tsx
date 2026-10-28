import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import EvaluacionesCuantitativasJurado from './EvaluacionesCuantitativasJurado';
import { useHasRole } from '../../hooks/useHasRole';
import { useNavegacionEvaluacionJurado } from './hooks/useNavegacionEvaluacionJurado';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useNavegacionEvaluacionJurado', () => ({
  useNavegacionEvaluacionJurado: vi.fn(),
}));
vi.mock('./components/estudiante/ConsultarEvaluacionesCuantitativasJurado', () => ({
  default: () => <p>Consulta de cuantitativas</p>,
}));

function montar() {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionJuradoId/cuantitativas"
        element={<EvaluacionesCuantitativasJurado />}
      />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/ej-1/cuantitativas' },
  );
}

describe('EvaluacionesCuantitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasRole).mockReturnValue(true);
  });

  it('con navegación muestra jurado, proyecto y versión, y migas hacia el origen', () => {
    // Arrange
    vi.mocked(useNavegacionEvaluacionJurado).mockReturnValue({
      evaluacionJuradoId: 'ej-1',
      evaluacionId: 'e-1',
      jurado: 'Ana Pérez',
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis',
      searchJurados: '?pagina=2',
    });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Evaluación cuantitativa' })).toBeInTheDocument();
    expect(
      screen.getByText('Jurado: Ana Pérez · Sistema de monitoreo · versión 3'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones?q=sis',
    );
    expect(screen.getByRole('link', { name: 'Evaluaciones del jurado' })).toHaveAttribute(
      'href',
      '/evaluaciones/e-1/jurados?pagina=2',
    );
    expect(screen.getByText('Consulta de cuantitativas')).toBeInTheDocument();
  });

  it('sin navegación muestra la descripción genérica y la miga sin search', () => {
    // Arrange
    vi.mocked(useNavegacionEvaluacionJurado).mockReturnValue(null);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Consulta los puntajes asignados por el jurado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones',
    );
  });

  it('un rol distinto de estudiante es redirigido a /forbidden', () => {
    // Arrange
    vi.mocked(useHasRole).mockReturnValue(false);
    vi.mocked(useNavegacionEvaluacionJurado).mockReturnValue(null);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Consulta de cuantitativas')).not.toBeInTheDocument();
  });
});
