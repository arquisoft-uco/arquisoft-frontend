import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../../test-utils/store.utils';
import { Rol } from '../../../../shared/models/rol';
import ConsultarEvaluacionesAsignadasJurado from './ConsultarEvaluacionesAsignadasJurado';
import { useEvaluacionesAsignadasJurado } from '../../hooks/useEvaluacionesAsignadasJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';

vi.mock('../../hooks/useEvaluacionesAsignadasJurado', () => ({
  useEvaluacionesAsignadasJurado: vi.fn(),
}));

const ASIGNACION: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  estado: { id: 'PENDIENTE_POR_EVALUAR', nombre: 'Pendiente por evaluar' },
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  tieneEvaluacionesCualitativas: false,
  tieneEvaluacionesCuantitativas: true,
};

const FINALIZADA: EvaluacionAsignadaJurado = {
  id: 'ej-2',
  estado: { id: 'EVALUADA', nombre: 'Evaluada' },
  evaluacion: { id: 'e-2', estado: { id: 'FINALIZADA', nombre: 'Finalizada' } },
  entregable: { id: 'en-2', proyecto: 'Plataforma de riego', version: 1 },
  tieneEvaluacionesCualitativas: true,
  tieneEvaluacionesCuantitativas: true,
};

type Hook = ReturnType<typeof useEvaluacionesAsignadasJurado>;

function pagina(content: EvaluacionAsignadaJurado[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function mockHook({
  data,
  ...parcial
}: Partial<Omit<Hook, 'data'>> & { data?: EvaluacionAsignadaJurado[] } = {}) {
  const hook = {
    data: data ? pagina(data) : undefined,
    isPlaceholderData: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    texto: '',
    setTexto: vi.fn(),
    estadoJuradoIds: [],
    toggleEstadoJurado: vi.fn(),
    limpiarEstadosJurado: vi.fn(),
    limpiarFiltros: vi.fn(),
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    ...parcial,
  } as Hook;
  vi.mocked(useEvaluacionesAsignadasJurado).mockReturnValue(hook);
  return hook;
}

describe('ConsultarEvaluacionesAsignadasJurado', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionesAsignadasJurado).mockReset();
  });

  it('muestra un estado de carga accesible y marca la región como ocupada', () => {
    // Arrange
    mockHook({ isLoading: true, isFetching: true });

    // Act
    render(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByRole('status', { busy: true })).toBeInTheDocument();
    expect(screen.queryByText(/asignadas?$/)).not.toBeInTheDocument();
  });

  it('con lista vacía muestra el vacío explicativo y no el error', () => {
    // Arrange
    mockHook({ data: [] });

    // Act
    render(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByText('Aún no tienes evaluaciones asignadas')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEvaluacionesAsignadasJurado />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar tus evaluaciones');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('lista proyecto, versión y estado en el orden recibido, con el resumen en singular y plural', () => {
    // Arrange
    mockHook({ data: [ASIGNACION] });
    const { rerender } = render(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByText('1 evaluación asignada')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Evaluaciones asignadas' });
    expect(tabla).toHaveTextContent('Sistema de monitoreo');
    expect(tabla).toHaveTextContent('Pendiente por evaluar');

    // Act
    mockHook({ data: [ASIGNACION, FINALIZADA] });
    rerender(<ConsultarEvaluacionesAsignadasJurado />);

    // Assert
    expect(screen.getByText('2 evaluaciones asignadas')).toBeInTheDocument();
    const filas = screen.getAllByRole('row');
    expect(filas[1]).toHaveTextContent('Sistema de monitoreo');
    expect(filas[2]).toHaveTextContent('Plataforma de riego');
    expect(filas[2]).toHaveTextContent('Evaluada');
  });

  it('ofrece los filtros por estado del jurado y alterna el elegido', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: [ASIGNACION] });
    render(<ConsultarEvaluacionesAsignadasJurado />);

    // Act
    await user.click(screen.getByRole('button', { name: /Evaluadas/ }));

    // Assert
    expect(screen.getByRole('button', { name: /Pendientes por evaluar/ })).toBeInTheDocument();
    expect(hook.toggleEstadoJurado).toHaveBeenCalledWith('EVALUADA');
  });

  it('con filtros y sin resultados ofrece limpiarlos', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: [], estadoJuradoIds: ['EVALUADA'] });
    render(<ConsultarEvaluacionesAsignadasJurado />);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Limpiar filtros' }).slice(-1)[0]);

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(hook.limpiarFiltros).toHaveBeenCalled();
  });

  describe('acción «Evaluar»', () => {
    function autenticarCon(rol: Rol) {
      setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
      setActiveRole(rol);
    }

    beforeEach(() => {
      resetAllStores();
    });

    it('con rol jurado ofrece «Evaluar» por fila, deshabilitado en la finalizada, y navega a la pantalla de registro', async () => {
      // Arrange
      const user = userEvent.setup();
      autenticarCon(Rol.Jurado);
      mockHook({ data: [ASIGNACION, FINALIZADA] });
      render(
        <Routes>
          <Route path="/" element={<ConsultarEvaluacionesAsignadasJurado />} />
          <Route path="/evaluaciones/:id/evaluar" element={<p>Pantalla de registro</p>} />
        </Routes>,
      );

      // Assert
      for (const boton of screen.getAllByRole('button', { name: 'Evaluar Plataforma de riego' })) {
        expect(boton).toBeDisabled();
      }

      // Act
      await user.click(screen.getAllByRole('button', { name: 'Evaluar Sistema de monitoreo' })[0]);

      // Assert
      expect(await screen.findByText('Pantalla de registro')).toBeInTheDocument();
    });

    it('con otro rol activo no hay acción de evaluar', () => {
      // Arrange
      autenticarCon(Rol.Coordinador);
      mockHook({ data: [ASIGNACION] });

      // Act
      render(<ConsultarEvaluacionesAsignadasJurado />);

      // Assert
      expect(screen.queryByRole('button', { name: /^Evaluar/ })).not.toBeInTheDocument();
    });
  });

  describe('indicadores de faltante y «Ver cualitativas»', () => {
    beforeEach(() => {
      resetAllStores();
      setAuthenticatedUser({
        tokenParsed: { sub: 'user-id', realm_access: { roles: [Rol.Jurado] } },
      });
      setActiveRole(Rol.Jurado);
    });

    it('muestra el faltante junto al badge de una pendiente y nada en la evaluada', () => {
      // Arrange
      mockHook({ data: [ASIGNACION, FINALIZADA] });

      // Act
      render(<ConsultarEvaluacionesAsignadasJurado />);

      // Assert
      const filas = screen.getAllByRole('row');
      expect(filas[1]).toHaveTextContent('Falta la cualitativa');
      expect(filas[2]).not.toHaveTextContent(/Falta|Faltan/);
    });

    it('ofrece «Ver cualitativas» solo si hay cualitativas y navega con el state', async () => {
      // Arrange
      const user = userEvent.setup();
      mockHook({ data: [ASIGNACION, FINALIZADA] });
      let estado: unknown;
      function Destino() {
        estado = useLocation().state;
        return <p>Pantalla de cualitativas</p>;
      }
      render(
        <Routes>
          <Route path="/" element={<ConsultarEvaluacionesAsignadasJurado />} />
          <Route path="/evaluaciones/:id/cualitativas-realizadas" element={<Destino />} />
        </Routes>,
      );

      // Assert
      expect(
        screen.queryByRole('button', { name: 'Ver cualitativas de Sistema de monitoreo' }),
      ).not.toBeInTheDocument();

      // Act
      await user.click(
        screen.getAllByRole('button', { name: 'Ver cualitativas de Plataforma de riego' })[0],
      );

      // Assert
      expect(await screen.findByText('Pantalla de cualitativas')).toBeInTheDocument();
      expect(estado).toEqual({
        evaluacionJuradoId: 'ej-2',
        search: '',
        resumen: { proyecto: 'Plataforma de riego', version: 1 },
      });
    });
  });
});
