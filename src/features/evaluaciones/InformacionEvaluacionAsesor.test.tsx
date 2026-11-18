import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import InformacionEvaluacionAsesor from './InformacionEvaluacionAsesor';
import { useHasRole } from '../../hooks/useHasRole';
import { useEvaluacionAsesorRealizada } from './hooks/useEvaluacionAsesorRealizada';
import { useNavegacionCualitativasAsesor } from './hooks/useNavegacionCualitativasAsesor';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useEvaluacionAsesorRealizada', () => ({
  useEvaluacionAsesorRealizada: vi.fn(),
}));
vi.mock('./hooks/useNavegacionCualitativasAsesor', () => ({
  useNavegacionCualitativasAsesor: vi.fn(),
}));
vi.mock('./components/asesor/ConsultarInformacionEvaluacionAsesor', () => ({
  default: () => <p>Cuerpo de la información</p>,
}));

type Consulta = ReturnType<typeof useEvaluacionAsesorRealizada>;

function consultaCon(parcial: Partial<Consulta> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Consulta;
}

function montar() {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionAsesorId/informacion"
        element={<InformacionEvaluacionAsesor />}
      />
    </Routes>,
    { initialPath: '/evaluaciones/ea-1/informacion' },
  );
}

describe('InformacionEvaluacionAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasRole).mockReturnValue(true);
    vi.mocked(useEvaluacionAsesorRealizada).mockReturnValue(consultaCon());
  });

  it('el asesor ve la cabecera con el resumen del state y migas que conservan la search', () => {
    // Arrange
    vi.mocked(useNavegacionCualitativasAsesor).mockReturnValue({
      evaluacionAsesorId: 'ea-1',
      search: '?q=sis&pagina=2',
      resumen: { proyecto: 'Sistema de monitoreo', version: 3 },
      evaluacionFinalizada: false,
    });

    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Información de la evaluación' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones?q=sis&pagina=2',
    );
    expect(screen.getByText('Cuerpo de la información')).toBeInTheDocument();
  });

  it('sin state la descripción sale de la respuesta y la miga vuelve sin search', () => {
    // Arrange
    vi.mocked(useNavegacionCualitativasAsesor).mockReturnValue(null);
    vi.mocked(useEvaluacionAsesorRealizada).mockReturnValue(
      consultaCon({
        data: {
          id: 'ea-1',
          evaluacion: {
            id: 'ev-1',
            entregable: { id: 'en-1', proyecto: 'Portal académico', version: 1 },
            estado: { id: 'e-1', nombre: 'En curso' },
          },
          asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
        },
      }),
    );

    // Act
    montar();

    // Assert
    expect(screen.getByText('Portal académico · versión 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones',
    );
  });

  it('un rol distinto de asesor es muestra Acceso denegado', () => {
    // Arrange
    vi.mocked(useHasRole).mockReturnValue(false);
    vi.mocked(useNavegacionCualitativasAsesor).mockReturnValue(null);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Cuerpo de la información')).not.toBeInTheDocument();
  });
});
