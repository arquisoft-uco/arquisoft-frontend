import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import { useEstadosRespuesta } from '../hooks/useEstadosRespuesta';
import type { FiltrosRespuestas } from '../hooks/useFiltrosRespuestas';
import RespuestasFiltros from './RespuestasFiltros';

vi.mock('../hooks/useEstadosRespuesta', () => ({
  useEstadosRespuesta: vi.fn(),
}));

type HookEstados = ReturnType<typeof useEstadosRespuesta>;

function mockearEstados(parcial: Partial<HookEstados>) {
  vi.mocked(useEstadosRespuesta).mockReturnValue({
    data: undefined,
    isError: false,
    ...parcial,
  } as HookEstados);
}

function crearFiltros(parcial: Partial<FiltrosRespuestas> = {}): FiltrosRespuestas {
  return {
    page: 0,
    estadoIds: [],
    ordenCampo: 'fechaRespuesta',
    ordenDireccion: 'DESC',
    hayFiltros: false,
    goToPage: vi.fn(),
    toggleEstado: vi.fn(),
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
}

describe('RespuestasFiltros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra un chip por estado del catálogo con su nombre y al elegirlo alterna ese estado', async () => {
    // Arrange
    const user = userEvent.setup();
    mockearEstados({
      data: [
        { id: 'APROBADA', nombre: 'Aprobada', descripcion: '' },
        { id: 'EN_REVISION', nombre: 'En revisión', descripcion: '' },
      ],
    });
    const filtros = crearFiltros();

    // Act
    render(<RespuestasFiltros filtros={filtros} />);
    await user.click(screen.getByRole('button', { name: 'En revisión' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprobada' })).toBeInTheDocument();
    expect(filtros.toggleEstado).toHaveBeenCalledWith('EN_REVISION');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con el catálogo caído solo avisa y no muestra chips ni campo de búsqueda', () => {
    // Arrange
    mockearEstados({ isError: true });

    // Act
    render(<RespuestasFiltros filtros={crearFiltros()} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Todos' })).not.toBeInTheDocument();
    expect(screen.getByText(/No se pudo cargar la lista de estados/)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('mientras carga el catálogo no muestra chips ni aviso', () => {
    // Arrange
    mockearEstados({});

    // Act
    render(<RespuestasFiltros filtros={crearFiltros()} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Todos' })).not.toBeInTheDocument();
    expect(screen.queryByText(/No se pudo cargar la lista de estados/)).not.toBeInTheDocument();
  });
});
