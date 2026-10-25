import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import EvaluacionesCualitativasJurado from './EvaluacionesCualitativasJurado';
import { useHasRole } from '../../hooks/useHasRole';
import { useNavegacionCualitativasJurado } from './hooks/useNavegacionCualitativasJurado';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useNavegacionCualitativasJurado', () => ({
  useNavegacionCualitativasJurado: vi.fn(),
}));
vi.mock('./components/estudiante/ConsultarEvaluacionesCualitativasJurado', () => ({
  default: () => <p>Consulta de cualitativas</p>,
}));

function montar() {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionJuradoId/cualitativas"
        element={<EvaluacionesCualitativasJurado />}
      />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/ej-1/cualitativas' },
  );
}

describe('EvaluacionesCualitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasRole).mockReturnValue(true);
  });

  it('con navegación muestra jurado, proyecto y versión, y migas hacia el origen', () => {
    // Arrange
    vi.mocked(useNavegacionCualitativasJurado).mockReturnValue({
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
    expect(screen.getByRole('heading', { name: 'Evaluación cualitativa' })).toBeInTheDocument();
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
    expect(screen.getByText('Consulta de cualitativas')).toBeInTheDocument();
  });

  it('sin navegación muestra la descripción genérica y la miga sin search', () => {
    // Arrange
    vi.mocked(useNavegacionCualitativasJurado).mockReturnValue(null);

    // Act
    montar();

    // Assert
    expect(
      screen.getByText('Consulta la retroalimentación cualitativa del jurado.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones',
    );
  });

  it('un rol distinto de estudiante es redirigido a /forbidden', () => {
    // Arrange
    vi.mocked(useHasRole).mockReturnValue(false);
    vi.mocked(useNavegacionCualitativasJurado).mockReturnValue(null);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Consulta de cualitativas')).not.toBeInTheDocument();
  });
});
