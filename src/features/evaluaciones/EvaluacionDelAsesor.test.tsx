import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import EvaluacionDelAsesor from './EvaluacionDelAsesor';
import { useHasRole } from '../../hooks/useHasRole';
import { useResumenEvaluacion } from './hooks/useResumenEvaluacion';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useEvaluacionAsesor', () => ({ useEvaluacionAsesor: vi.fn() }));
vi.mock('./components/estudiante/ConsultarEvaluacionAsesor', () => ({
  default: () => <p>Cuerpo del asesor</p>,
}));
vi.mock('./hooks/useResumenEvaluacion', () => ({ useResumenEvaluacion: vi.fn() }));

function montar() {
  return render(
    <Routes>
      <Route path="/evaluaciones/:evaluacionId/asesor" element={<EvaluacionDelAsesor />} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/e-1/asesor' },
  );
}

describe('EvaluacionDelAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasRole).mockReturnValue(true);
  });

  it('el estudiante ve migas con el search del listado, el proyecto con su versión y el cuerpo', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue({
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis&pagina=2',
    });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Evaluación del asesor' })).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones?q=sis&pagina=2',
    );
    expect(screen.getByText('Cuerpo del asesor')).toBeInTheDocument();
  });

  it('sin state de navegación muestra la descripción genérica y la miga sin search', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue({ resumen: null, search: '' });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Consulta el asesor que evaluó este entregable.')).toBeInTheDocument();
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
    expect(screen.queryByText('Cuerpo del asesor')).not.toBeInTheDocument();
  });
});
