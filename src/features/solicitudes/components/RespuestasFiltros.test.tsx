import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
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
    texto: '',
    estadoIds: [],
    ordenCampo: 'fechaRespuesta',
    ordenDireccion: 'DESC',
    hayFiltros: false,
    goToPage: vi.fn(),
    setTexto: vi.fn(),
    toggleEstado: vi.fn(),
    limpiarEstados: vi.fn(),
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  };
}

describe('RespuestasFiltros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('muestra un chip por estado del catálogo con su nombre y al elegirlo alterna ese estado', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
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
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('escribir texto llama a setTexto tras el retardo de la búsqueda', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    mockearEstados({ data: [] });
    const filtros = crearFiltros();
    render(<RespuestasFiltros filtros={filtros} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar respuestas' }), 'reunión');
    avanzar(300);

    // Assert
    expect(filtros.setTexto).toHaveBeenLastCalledWith('reunión');
  });

  it('con el catálogo caído no muestra chips, avisa y la búsqueda sigue disponible', () => {
    // Arrange
    mockearEstados({ isError: true });

    // Act
    render(<RespuestasFiltros filtros={crearFiltros()} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Todos' })).not.toBeInTheDocument();
    expect(screen.getByText(/No se pudo cargar la lista de estados/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar respuestas' })).toBeInTheDocument();
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
