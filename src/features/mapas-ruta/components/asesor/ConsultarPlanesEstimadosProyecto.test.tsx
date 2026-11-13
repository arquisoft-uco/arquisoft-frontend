import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { usePlanesEstimadosProyectoAsesor } from '../../hooks/usePlanesEstimadosProyectoAsesor';
import ConsultarPlanesEstimadosProyecto from './ConsultarPlanesEstimadosProyecto';

vi.mock('../../hooks/usePlanesEstimadosProyectoAsesor', () => ({
  usePlanesEstimadosProyectoAsesor: vi.fn(),
}));

const useListado = vi.mocked(usePlanesEstimadosProyectoAsesor);

const PLAN = {
  id: 'p-1',
  tareaId: 't-1',
  descripcionTarea: 'Entregar informe',
  mapaRutaId: 'm-1',
  tiempoEstimadoDias: 5,
  descripcionEstimado: 'Redactar borrador',
};
const PLAN_SIN_DESCRIPCION = {
  ...PLAN,
  id: 'p-2',
  descripcionTarea: 'Preparar demo',
  tiempoEstimadoDias: 1,
  descripcionEstimado: null,
};

const PAGINA_VACIA = { content: [], totalElements: 0, totalPages: 0 };

function simularListado(parcial: Record<string, unknown> = {}) {
  const base = {
    data: { content: [PLAN, PLAN_SIN_DESCRIPCION], totalElements: 2, totalPages: 1 },
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    texto: '',
    setTexto: vi.fn(),
    ordenCampo: 'tiempoEstimadoDias',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    hayFiltros: false,
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
  useListado.mockReturnValue(base as never);
  return base;
}

describe('ConsultarPlanesEstimadosProyecto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el resumen y cada plan con su tarea, días y descripción o "Sin descripción"', () => {
    // Arrange
    simularListado();

    // Act
    render(<ConsultarPlanesEstimadosProyecto proyectoGradoId="pg-1" />);

    // Assert
    expect(screen.getByText('2 planes estimados')).toBeInTheDocument();
    expect(screen.getAllByText('Entregar informe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5 días').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 día').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Redactar borrador').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sin descripción').length).toBeGreaterThan(0);
  });

  it('cada fila ofrece "Aportar" y al pulsarlo abre el panel con el plan de esa fila', async () => {
    // Arrange
    simularListado();
    render(<ConsultarPlanesEstimadosProyecto proyectoGradoId="pg-1" />);

    // Act
    const botones = screen.getAllByRole('button', { name: /^Aportar al plan de/ });
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Aportar al plan de Preparar demo' })[0],
    );

    // Assert
    expect(botones.length).toBeGreaterThanOrEqual(2);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveValue('');
  });

  it('muestra el estado de carga mientras consulta', () => {
    // Arrange
    simularListado({ data: undefined, isLoading: true });

    // Act
    render(<ConsultarPlanesEstimadosProyecto proyectoGradoId="pg-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('ante un error muestra la alerta y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const { refetch } = simularListado({
      data: undefined,
      isError: true,
      error: new Error('falló'),
    });
    render(<ConsultarPlanesEstimadosProyecto proyectoGradoId="pg-1" />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin planes muestra el vacío de solo lectura', () => {
    // Arrange
    simularListado({ data: PAGINA_VACIA });

    // Act
    render(<ConsultarPlanesEstimadosProyecto proyectoGradoId="pg-1" />);

    // Assert
    expect(screen.getByText('Este proyecto aún no tiene planes estimados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /limpiar filtros/i })).not.toBeInTheDocument();
  });

  it('una búsqueda sin resultados ofrece "Limpiar filtros"', async () => {
    // Arrange
    const { limpiarFiltros } = simularListado({
      data: PAGINA_VACIA,
      hayFiltros: true,
      texto: 'zzz',
    });
    render(<ConsultarPlanesEstimadosProyecto proyectoGradoId="pg-1" />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(limpiarFiltros).toHaveBeenCalled();
  });

  it('ordenar por una columna llama al hook con su campo', async () => {
    // Arrange
    const { setOrden } = simularListado();
    render(<ConsultarPlanesEstimadosProyecto proyectoGradoId="pg-1" />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /^tarea/i }));

    // Assert
    expect(setOrden).toHaveBeenCalledWith('descripcionTarea', expect.any(String));
  });
});
