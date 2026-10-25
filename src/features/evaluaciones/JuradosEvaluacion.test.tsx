import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../test-utils/render';
import JuradosEvaluacion from './JuradosEvaluacion';
import { useHasRole } from '../../hooks/useHasRole';
import { useResumenEvaluacion } from './hooks/useResumenEvaluacion';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./hooks/useJuradosEvaluacion', () => ({ useJuradosEvaluacion: vi.fn() }));
vi.mock('./components/estudiante/ListadoJuradosEvaluacion', () => ({
  default: ({
    acciones,
  }: {
    acciones?: (jurado: {
      id: string;
      jurado: { id: string; nombre: string; email: string };
    }) => ReactNode;
  }) => (
    <div>
      <p>Listado de jurados</p>
      {acciones?.({
        id: 'ej-1',
        jurado: { id: 'j-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
      })}
    </div>
  ),
}));
vi.mock('./hooks/useResumenEvaluacion', () => ({ useResumenEvaluacion: vi.fn() }));

let stateDestino: unknown;

function Destino() {
  stateDestino = useLocation().state;
  return <p>Destino cualitativas</p>;
}

function montar() {
  return render(
    <Routes>
      <Route path="/evaluaciones/:evaluacionId/jurados" element={<JuradosEvaluacion />} />
      <Route path="/evaluaciones/:id/cualitativas" element={<Destino />} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/e-1/jurados?pagina=2' },
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

  it('«Ver evaluación cualitativa» navega a la ruta del jurado con el contexto en el state', async () => {
    // Arrange
    const resumen = { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 };
    vi.mocked(useResumenEvaluacion).mockReturnValue({ resumen, search: '?q=sis' });
    montar();

    // Act
    await userEvent.click(
      screen.getByRole('button', { name: 'Ver evaluación cualitativa de Ana Pérez' }),
    );

    // Assert
    expect(screen.getByText('Destino cualitativas')).toBeInTheDocument();
    expect(stateDestino).toEqual({
      evaluacionJuradoId: 'ej-1',
      evaluacionId: 'e-1',
      jurado: 'Ana Pérez',
      resumen,
      search: '?q=sis',
      searchJurados: '?pagina=2',
    });
  });
});
