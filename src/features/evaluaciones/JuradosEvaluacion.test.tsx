import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import JuradosEvaluacion from './JuradosEvaluacion';
import { useHasRole } from '../../hooks/useHasRole';
import { useResumenEvaluacion } from './hooks/useResumenEvaluacion';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useJuradosEvaluacion', () => ({ useJuradosEvaluacion: vi.fn() }));
vi.mock('./components/estudiante/ListadoJuradosEvaluacion', () => ({
  default: () => <p>Listado de jurados</p>,
}));
vi.mock('./hooks/useResumenEvaluacion', () => ({ useResumenEvaluacion: vi.fn() }));

function montar() {
  return render(
    <Routes>
      <Route path="/evaluaciones/:evaluacionId/jurados" element={<JuradosEvaluacion />} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/e-1/jurados' },
  );
}

describe('JuradosEvaluacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasRole).mockReturnValue(true);
  });

  it('el estudiante ve migas con el search del listado, el proyecto con su versión y los jurados', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue({
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis&pagina=2',
    });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Evaluaciones del jurado' })).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones?q=sis&pagina=2',
    );
    expect(screen.getByText('Listado de jurados')).toBeInTheDocument();
  });

  it('sin state de navegación muestra la descripción genérica y la miga sin search', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue({ resumen: null, search: '' });

    // Act
    montar();

    // Assert
    expect(
      screen.getByText('Consulta los jurados asignados a esta evaluación.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones',
    );
  });

  it('un rol distinto de estudiante es redirigido a /forbidden', () => {
    // Arrange
    vi.mocked(useHasRole).mockReturnValue(false);
    vi.mocked(useResumenEvaluacion).mockReturnValue({ resumen: null, search: '' });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Listado de jurados')).not.toBeInTheDocument();
  });
});
