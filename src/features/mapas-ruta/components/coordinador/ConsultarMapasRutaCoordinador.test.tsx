import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useMapasRutaCoordinador } from '../../hooks/useMapasRutaCoordinador';
import ConsultarMapasRutaCoordinador from './ConsultarMapasRutaCoordinador';

vi.mock('../../hooks/useMapasRutaCoordinador', () => ({ useMapasRutaCoordinador: vi.fn() }));

const useListado = vi.mocked(useMapasRutaCoordinador);

const FECHAS_VACIAS = { inicioDesde: '', inicioHasta: '', finDesde: '', finHasta: '' };

function configurar(cambios: Record<string, unknown> = {}) {
  const base = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    fechas: FECHAS_VACIAS,
    setFecha: vi.fn(),
    ordenCampo: 'fechaInicio',
    ordenDireccion: 'DESC',
    setOrden: vi.fn(),
    hayFiltros: false,
    limpiarFiltros: vi.fn(),
    ...cambios,
  };
  useListado.mockReturnValue(base as never);
  return base;
}

describe('ConsultarMapasRutaCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el esqueleto mientras carga', () => {
    // Arrange
    configurar({ isLoading: true });

    // Act
    render(<ConsultarMapasRutaCoordinador onNuevoMapa={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('ante un error muestra la alerta y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const { refetch } = configurar({ isError: true, error: new Error('falló') });
    render(<ConsultarMapasRutaCoordinador onNuevoMapa={vi.fn()} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el resumen, las filas con fechas formateadas y el chip del filtro aplicado', () => {
    // Arrange
    configurar({
      data: {
        content: [
          {
            id: 'm-1',
            proyectoGradoId: 'p-1',
            titulo: 'Sistema A',
            fechaInicio: '2026-03-05',
            fechaFin: '2026-08-01',
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
      hayFiltros: true,
      fechas: { ...FECHAS_VACIAS, inicioDesde: '2026-03-05' },
    });

    // Act
    render(<ConsultarMapasRutaCoordinador onNuevoMapa={vi.fn()} />);

    // Assert
    expect(screen.getByText('1 mapa de ruta')).toBeInTheDocument();
    expect(screen.getAllByText('Sistema A').length).toBeGreaterThan(0);
    expect(screen.getByText(/Inicia desde: .*5.*2026/)).toBeInTheDocument();
  });
});
