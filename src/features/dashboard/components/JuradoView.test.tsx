import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import { useConteos } from '../hooks/useConteos';
import { useEvaluacionesPorEvaluar } from '../hooks/useEvaluacionesPorEvaluar';
import JuradoView from './JuradoView';

vi.mock('../hooks/useEvaluacionesPorEvaluar', () => ({ useEvaluacionesPorEvaluar: vi.fn() }));
vi.mock('../hooks/useConteos', () => ({ useConteos: vi.fn() }));

function bandejaMock(parcial: Partial<ReturnType<typeof useEvaluacionesPorEvaluar>> = {}) {
  vi.mocked(useEvaluacionesPorEvaluar).mockReturnValue({
    evaluaciones: [
      {
        id: 'ej-1',
        proyecto: 'Sistema de alertas',
        versionEntregable: 2,
        estadoId: 'PENDIENTE_POR_EVALUAR',
        estadoNombre: 'Pendiente por evaluar',
      },
    ],
    total: 1,
    estadoPorEvaluar: 'PENDIENTE_POR_EVALUAR',
    cargado: true,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEvaluacionesPorEvaluar>);
}

describe('JuradoView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', given_name: 'Julia' } });
    bandejaMock();
    vi.mocked(useConteos).mockImplementation((recursos) => ({
      valores: recursos.map(() => 3),
      total: undefined,
      cargando: false,
      hayError: false,
      reintentar: vi.fn(),
    }));
  });

  it('lista las evaluaciones pendientes y «Ver todas» abre el listado ya filtrado', () => {
    render(<JuradoView />);

    expect(screen.getByText('Tienes 1 evaluación por evaluar.')).toBeInTheDocument();
    const bandeja = screen.getByRole('region', { name: 'Evaluaciones por evaluar' });
    expect(within(bandeja).getByText('Sistema de alertas')).toBeInTheDocument();
    expect(within(bandeja).getByText('Versión 2 del entregable')).toBeInTheDocument();
    expect(within(bandeja).getByText('Pendiente por evaluar')).toBeInTheDocument();
    expect(within(bandeja).getByRole('link', { name: 'Ver todas' })).toHaveAttribute(
      'href',
      '/evaluaciones?estadoJurado=PENDIENTE_POR_EVALUAR',
    );
    expect(
      within(screen.getByRole('region', { name: 'Resumen' })).getByRole('link', {
        name: /Entregables asignados/,
      }),
    ).toHaveAttribute('href', '/entregables');
  });

  it('mientras carga muestra el esqueleto y nunca el vacío', () => {
    bandejaMock({ evaluaciones: [], total: undefined, cargado: false });

    render(<JuradoView />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando las evaluaciones por evaluar');
    expect(screen.queryByText('No tienes evaluaciones por evaluar')).not.toBeInTheDocument();
  });

  it('sin pendientes muestra el vacío', () => {
    bandejaMock({ evaluaciones: [], total: 0 });

    render(<JuradoView />);

    expect(screen.getByText('No tienes evaluaciones por evaluar.')).toBeInTheDocument();
    expect(screen.getByText('No tienes evaluaciones por evaluar')).toBeInTheDocument();
  });
});
