import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { usePlanesRealesProyectoAsesor } from '../../hooks/usePlanesRealesProyectoAsesor';
import ConsultarPlanesRealesProyectoAsesor from './ConsultarPlanesRealesProyectoAsesor';

vi.mock('../../hooks/usePlanesRealesProyectoAsesor', () => ({
  usePlanesRealesProyectoAsesor: vi.fn(),
}));

const useListado = vi.mocked(usePlanesRealesProyectoAsesor);

const PLAN_CON_DESCRIPCION = {
  id: 'r-1',
  tareaId: 't-1',
  descripcionTarea: 'Entregar informe',
  tiempoRealDias: 1,
  descripcionReal: 'Redacción final',
};

const PLAN_SIN_DESCRIPCION = {
  id: 'r-2',
  tareaId: 't-2',
  descripcionTarea: 'Preparar demo',
  tiempoRealDias: 4,
  descripcionReal: null,
};

const PAGINA_VACIA = { content: [], totalElements: 0, totalPages: 0 };

function simularListado(parcial: Record<string, unknown> = {}) {
  const base = {
    data: {
      content: [PLAN_CON_DESCRIPCION, PLAN_SIN_DESCRIPCION],
      totalElements: 2,
      totalPages: 1,
    },
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
    ordenCampo: 'tiempoRealDias',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    hayFiltros: false,
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
  useListado.mockReturnValue(base as never);
  return base;
}

describe('ConsultarPlanesRealesProyectoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el resumen, la tarea sin enlace, los días y "Sin descripción" cuando es null', () => {
    // Arrange
    simularListado();

    // Act
    render(<ConsultarPlanesRealesProyectoAsesor proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('2 planes reales')).toBeInTheDocument();
    expect(screen.getAllByText('Entregar informe').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /entregar informe/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('1 día').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4 días').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Redacción final').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sin descripción').length).toBeGreaterThan(0);
  });

  it('cada fila ofrece "Aportar" y al pulsarlo abre el panel con el plan de esa fila', async () => {
    // Arrange
    simularListado();
    render(<ConsultarPlanesRealesProyectoAsesor proyectoGradoId="p-1" />);

    // Act
    const botones = screen.getAllByRole('button', { name: /^Aportar al plan real de/ });
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Aportar al plan real de Entregar informe' })[0],
    );

    // Assert
    expect(botones.length).toBeGreaterThanOrEqual(2);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveValue('Redacción final');
  });

  it('muestra el estado de carga mientras consulta', () => {
    // Arrange
    simularListado({ data: undefined, isLoading: true });

    // Act
    render(<ConsultarPlanesRealesProyectoAsesor proyectoGradoId="p-1" />);

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
    render(<ConsultarPlanesRealesProyectoAsesor proyectoGradoId="p-1" />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin planes muestra el vacío de solo lectura, sin acción', () => {
    // Arrange
    simularListado({ data: PAGINA_VACIA });

    // Act
    render(<ConsultarPlanesRealesProyectoAsesor proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('Aún no hay planes reales')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /limpiar filtros/i })).not.toBeInTheDocument();
  });

  it('una búsqueda sin resultados ofrece "Limpiar filtros"', async () => {
    // Arrange
    const { limpiarFiltros } = simularListado({
      data: PAGINA_VACIA,
      hayFiltros: true,
      texto: 'zzz',
    });
    render(<ConsultarPlanesRealesProyectoAsesor proyectoGradoId="p-1" />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(limpiarFiltros).toHaveBeenCalled();
  });
});
