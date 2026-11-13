import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useTareasMapaRutaAsesor } from '../../hooks/useTareasMapaRutaAsesor';
import ConsultarTareasMapaRutaAsesor from './ConsultarTareasMapaRutaAsesor';

vi.mock('../../hooks/useTareasMapaRutaAsesor', () => ({ useTareasMapaRutaAsesor: vi.fn() }));

const useListado = vi.mocked(useTareasMapaRutaAsesor);

const TAREA = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

const PAGINA_VACIA = { content: [], totalElements: 0, totalPages: 0 };

function simularListado(parcial: Record<string, unknown> = {}) {
  const base = {
    data: { content: [TAREA], totalElements: 1, totalPages: 1 },
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
    ordenCampo: 'descripcion',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    hayFiltros: false,
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
  useListado.mockReturnValue(base as never);
  return base;
}

describe('ConsultarTareasMapaRutaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el resumen y cada tarea con su descripción como texto, estado y asesor', () => {
    // Arrange
    simularListado();

    // Act
    render(<ConsultarTareasMapaRutaAsesor mapaRutaId="m-1" />);

    // Assert
    expect(screen.getByText('1 tarea')).toBeInTheDocument();
    expect(screen.getAllByText('Entregar informe').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /entregar informe/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Nueva').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ana Ruiz').length).toBeGreaterThan(0);
  });

  it('muestra el estado de carga mientras consulta', () => {
    // Arrange
    simularListado({ data: undefined, isLoading: true });

    // Act
    render(<ConsultarTareasMapaRutaAsesor mapaRutaId="m-1" />);

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
    render(<ConsultarTareasMapaRutaAsesor mapaRutaId="m-1" />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin tareas muestra el vacío de solo lectura, sin acción', () => {
    // Arrange
    simularListado({ data: PAGINA_VACIA });

    // Act
    render(<ConsultarTareasMapaRutaAsesor mapaRutaId="m-1" />);

    // Assert
    expect(screen.getByText('Este mapa de ruta aún no tiene tareas')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /agregar|crear|asignar/i }),
    ).not.toBeInTheDocument();
  });

  it('una búsqueda sin resultados ofrece "Limpiar filtros"', async () => {
    // Arrange
    const { limpiarFiltros } = simularListado({
      data: PAGINA_VACIA,
      hayFiltros: true,
      texto: 'zzz',
    });
    render(<ConsultarTareasMapaRutaAsesor mapaRutaId="m-1" />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(limpiarFiltros).toHaveBeenCalled();
  });
});
