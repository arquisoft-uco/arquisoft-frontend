import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import EvaluacionDelAsesor from './EvaluacionDelAsesor';
import { useHasRole } from '../../hooks/useHasRole';
import { useResumenEvaluacion } from './hooks/useResumenEvaluacion';
import { useEvaluacionAsesor } from './hooks/useEvaluacionAsesor';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useEvaluacionAsesor', () => ({ useEvaluacionAsesor: vi.fn() }));
vi.mock('./components/estudiante/ConsultarEvaluacionAsesor', () => ({
  default: () => <p>Cuerpo del asesor</p>,
}));
vi.mock('./components/estudiante/ConsultarEvaluacionesCuantitativasAsesorEstudiante', () => ({
  default: ({ evaluacionAsesorId }: { evaluacionAsesorId: string }) => (
    <p>{`Cuantitativas del asesor ${evaluacionAsesorId}`}</p>
  ),
}));
vi.mock('./components/estudiante/ConsultarEvaluacionesCualitativasAsesorEstudiante', () => ({
  default: ({ evaluacionAsesorId }: { evaluacionAsesorId: string }) => (
    <p>{`Cualitativas del asesor ${evaluacionAsesorId}`}</p>
  ),
}));
vi.mock('./hooks/useResumenEvaluacion', () => ({ useResumenEvaluacion: vi.fn() }));

const RESUMEN_VALIDO = { resumen: { id: 'e-1', proyecto: 'Sistema', version: 3 }, search: '' };

function montar() {
  return render(
    <Routes>
      <Route path="/evaluaciones" element={<p>Listado de evaluaciones</p>} />
      <Route path="/evaluaciones/:evaluacionId/asesor" element={<EvaluacionDelAsesor />} />
    </Routes>,
    { initialPath: '/evaluaciones/e-1/asesor' },
  );
}

describe('EvaluacionDelAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasRole).mockReturnValue(true);
    const parcial: Partial<ReturnType<typeof useEvaluacionAsesor>> = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    vi.mocked(useEvaluacionAsesor).mockReturnValue({
      ...parcial,
    } as ReturnType<typeof useEvaluacionAsesor>);
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

  it('sin resumen en el state ni en el snapshot redirige al listado de evaluaciones', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue({ resumen: null, search: '' });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Listado de evaluaciones')).toBeInTheDocument();
    expect(screen.queryByText('Cuerpo del asesor')).not.toBeInTheDocument();
  });

  it('con evaluación del asesor monta las secciones de cuantitativas y cualitativas', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue(RESUMEN_VALIDO);
    const parcial: Partial<ReturnType<typeof useEvaluacionAsesor>> = {
      data: {
        id: 'ea-1',
        asesor: { id: 'a-1', nombre: 'Ana', email: 'ana@uco.edu.co' },
        notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    vi.mocked(useEvaluacionAsesor).mockReturnValue(
      parcial as ReturnType<typeof useEvaluacionAsesor>,
    );

    // Act
    montar();

    // Assert
    expect(screen.getByText('Cuantitativas del asesor ea-1')).toBeInTheDocument();
    expect(screen.getByText('Cualitativas del asesor ea-1')).toBeInTheDocument();
  });

  it('sin evaluación del asesor no monta las secciones de cuantitativas y cualitativas', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue(RESUMEN_VALIDO);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Cuerpo del asesor')).toBeInTheDocument();
    expect(screen.queryByText(/Cuantitativas del asesor/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cualitativas del asesor/)).not.toBeInTheDocument();
  });

  it('un rol distinto de estudiante es muestra Acceso denegado', () => {
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
