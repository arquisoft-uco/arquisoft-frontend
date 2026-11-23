import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../test-utils/render';
import EvaluacionesCualitativasJurado from './EvaluacionesCualitativasJurado';
import { useHasRole } from '../../hooks/useHasRole';
import { useNavegacionEvaluacionJurado } from './hooks/useNavegacionEvaluacionJurado';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useEvaluacionesCualitativasJurado', () => ({
  useEvaluacionesCualitativasJurado: vi.fn(() => ({})),
}));
vi.mock('./hooks/useNavegacionEvaluacionJurado', () => ({
  useNavegacionEvaluacionJurado: vi.fn(),
}));
vi.mock('./components/ConsultarEvaluacionesCualitativasJurado', () => ({
  default: ({ onVolver, etiquetaVolver }: { onVolver: () => void; etiquetaVolver: string }) => (
    <div>
      <p>Consulta de cualitativas</p>
      <button type="button" onClick={onVolver}>
        {etiquetaVolver}
      </button>
    </div>
  ),
}));

function Jurados() {
  const { state } = useLocation();
  return <pre aria-label="state recibido">{JSON.stringify(state)}</pre>;
}

const NAVEGACION = {
  evaluacionJuradoId: 'ej-1',
  evaluacionId: 'e-1',
  jurado: 'Ana Pérez',
  resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
  search: '?q=sis',
  searchJurados: '?pagina=2',
};

function montar() {
  return render(
    <Routes>
      <Route path="/evaluaciones" element={<p>Listado de evaluaciones</p>} />
      <Route path="/evaluaciones/:evaluacionId/jurados" element={<Jurados />} />
      <Route
        path="/evaluaciones/:evaluacionJuradoId/cualitativas"
        element={<EvaluacionesCualitativasJurado />}
      />
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

  it('sin navegación en el state ni en el snapshot redirige al listado de evaluaciones', () => {
    // Arrange
    vi.mocked(useNavegacionEvaluacionJurado).mockReturnValue(null);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Listado de evaluaciones')).toBeInTheDocument();
    expect(screen.queryByText('Consulta de cualitativas')).not.toBeInTheDocument();
  });

  it('la miga y el botón a los jurados llevan el contexto en el state, para no redirigir con el snapshot vencido', async () => {
    // Arrange
    vi.mocked(useNavegacionEvaluacionJurado).mockReturnValue(NAVEGACION);
    const user = userEvent.setup();
    const esperado = { resumen: NAVEGACION.resumen, search: '?q=sis' };

    // Act
    const montada = montar();
    await user.click(screen.getByRole('link', { name: 'Evaluaciones del jurado' }));

    // Assert
    expect(JSON.parse(screen.getByLabelText('state recibido').textContent ?? '')).toEqual(esperado);
    montada.unmount();

    // Act
    montar();
    await user.click(screen.getByRole('button', { name: 'Volver a los jurados' }));

    // Assert
    expect(JSON.parse(screen.getByLabelText('state recibido').textContent ?? '')).toEqual(esperado);
  });

  it('un rol distinto de estudiante es muestra Acceso denegado', () => {
    // Arrange
    vi.mocked(useHasRole).mockReturnValue(false);
    vi.mocked(useNavegacionEvaluacionJurado).mockReturnValue(null);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Consulta de cualitativas')).not.toBeInTheDocument();
  });
});
