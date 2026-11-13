import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useMapaRutaProyectoAsesor } from '../../hooks/useMapaRutaProyectoAsesor';
import { useProyectosAsesor } from '../../hooks/useProyectosAsesor';
import ConsultarMapasRutaAsesor from './ConsultarMapasRutaAsesor';

vi.mock('../../hooks/useProyectosAsesor', () => ({ useProyectosAsesor: vi.fn() }));
vi.mock('../../hooks/useMapaRutaProyectoAsesor', () => ({ useMapaRutaProyectoAsesor: vi.fn() }));

const useListado = vi.mocked(useProyectosAsesor);
const useMapa = vi.mocked(useMapaRutaProyectoAsesor);

const PROYECTO = { id: 'p-1', titulo: 'Sistema A' };
const SIN_PROYECTOS = { content: [], totalElements: 0, totalPages: 0 };

function configurarListado(cambios: Record<string, unknown> = {}) {
  const base = {
    data: { content: [PROYECTO], totalElements: 1, totalPages: 1 },
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
    ordenCampo: 'tituloProyecto',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    hayFiltros: false,
    limpiarFiltros: vi.fn(),
    ...cambios,
  };
  useListado.mockReturnValue(base as never);
  return base;
}

function configurarMapa(cambios: Record<string, unknown> = {}) {
  const base = {
    mapa: undefined,
    cargando: false,
    sinMapa: false,
    hayError: false,
    reintentar: vi.fn(),
    ...cambios,
  };
  useMapa.mockReturnValue(base as never);
  return base;
}

describe('ConsultarMapasRutaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el esqueleto mientras carga el listado', () => {
    // Arrange
    configurarListado({ data: undefined, isLoading: true });
    configurarMapa();

    // Act
    render(<ConsultarMapasRutaAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('ante un error del listado muestra la alerta y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const { refetch } = configurarListado({
      data: undefined,
      isError: true,
      error: new Error('falló'),
    });
    configurarMapa();
    render(<ConsultarMapasRutaAsesor />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el resumen, el proyecto y las fechas de su mapa', () => {
    // Arrange
    configurarListado();
    configurarMapa({
      mapa: {
        id: 'm-1',
        proyectoGradoId: 'p-1',
        titulo: 'Sistema A',
        fechaInicio: '2026-03-05',
        fechaFin: '2026-08-01',
      },
    });

    // Act
    render(<ConsultarMapasRutaAsesor />);

    // Assert
    expect(screen.getByText('1 proyecto')).toBeInTheDocument();
    expect(screen.getAllByText('Sistema A').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Inicio .*2026 · Fin .*2026/).length).toBeGreaterThan(0);
  });

  it('muestra "Sin mapa de ruta" cuando el proyecto no tiene mapa', () => {
    // Arrange
    configurarListado();
    configurarMapa({ sinMapa: true });

    // Act
    render(<ConsultarMapasRutaAsesor />);

    // Assert
    expect(screen.getAllByText('Sin mapa de ruta').length).toBeGreaterThan(0);
    expect(screen.queryByText('No se pudo cargar')).not.toBeInTheDocument();
  });

  it('ante un error de la fila muestra "No se pudo cargar" y "Reintentar" consulta esa fila', async () => {
    // Arrange
    const { reintentar } = configurarMapa({ hayError: true });
    configurarListado();
    render(<ConsultarMapasRutaAsesor />);

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: /reintentar/i })[0]);

    // Assert
    expect(screen.getAllByText('No se pudo cargar').length).toBeGreaterThan(0);
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('sin proyectos muestra el vacío del asesor', () => {
    // Arrange
    configurarListado({ data: SIN_PROYECTOS });
    configurarMapa();

    // Act
    render(<ConsultarMapasRutaAsesor />);

    // Assert
    expect(screen.getByText('Aún no asesoras proyectos de grado')).toBeInTheDocument();
  });

  it('una búsqueda sin resultados ofrece "Limpiar filtros"', async () => {
    // Arrange
    const { limpiarFiltros } = configurarListado({
      data: SIN_PROYECTOS,
      hayFiltros: true,
      texto: 'zzz',
    });
    configurarMapa();
    render(<ConsultarMapasRutaAsesor />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(limpiarFiltros).toHaveBeenCalled();
  });

  it('el título del proyecto enlaza a sus tareas solo cuando tiene mapa', () => {
    // Arrange
    configurarListado();
    configurarMapa({
      mapa: {
        id: 'm-1',
        proyectoGradoId: 'p-1',
        titulo: 'Sistema A',
        fechaInicio: '2026-03-05',
        fechaFin: '2026-08-01',
      },
    });

    // Act
    const { unmount } = render(<ConsultarMapasRutaAsesor />);

    // Assert
    expect(screen.getAllByRole('link', { name: 'Ver las tareas de Sistema A' })[0]).toHaveAttribute(
      'href',
      '/mapas-ruta/proyectos/p-1/tareas',
    );
    unmount();

    // Arrange
    configurarMapa({ sinMapa: true });

    // Act
    render(<ConsultarMapasRutaAsesor />);

    // Assert
    expect(screen.queryByRole('link', { name: /ver las tareas de/i })).not.toBeInTheDocument();
  });
});
