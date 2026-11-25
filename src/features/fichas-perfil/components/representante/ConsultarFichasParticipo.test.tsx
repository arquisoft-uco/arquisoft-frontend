import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarFichasParticipo from './ConsultarFichasParticipo';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import { useFichasParticipacion } from '../../hooks/useFichasParticipacion';
import type { Page } from '../../../../shared/models/api-response';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';

vi.mock('../../hooks/useFichasParticipacion', () => ({ useFichasParticipacion: vi.fn() }));
vi.mock('../../hooks/useEstadosFicha', () => ({ useEstadosFicha: vi.fn() }));

const FICHA: FichaPerfilRepresentante = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  asesorNombre: 'Ana Pérez',
  asesorEmail: 'ana@uco.edu.co',
  estadoId: 'DISPONIBLE_PARA_EVALUACION',
  estadoActual: 'Disponible para evaluación',
  estadoFechaActualizacion: '2026-10-01T15:30:00Z',
  evaluacionId: 'ev-1',
  evaluacionEstadoId: 'DESCARTADA',
  evaluacionEstadoNombre: 'Descartada',
};

function crearPagina(content: FichaPerfilRepresentante[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  } as Page<FichaPerfilRepresentante>;
}

function mockHook(parcial: Partial<ReturnType<typeof useFichasParticipacion>> = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    filtros: { titulo: '', asesorNombre: '', asesorEmail: '', estadoIds: [] },
    setTitulo: vi.fn(),
    setAsesorNombre: vi.fn(),
    setAsesorEmail: vi.fn(),
    ordenCampo: 'tituloProyecto',
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    toggleEstado: vi.fn(),
    limpiarEstados: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasParticipacion>;
  vi.mocked(useFichasParticipacion).mockReturnValue(hook);
  return hook;
}

function mockEstados(data?: { id: string; nombre: string; descripcion: string }[]) {
  vi.mocked(useEstadosFicha).mockReturnValue({ data } as ReturnType<typeof useEstadosFicha>);
}

function EstadoDeNavegacion() {
  const { pathname, search, state } = useLocation();
  return <p>{`destino:${pathname}${search}:${JSON.stringify(state)}`}</p>;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Fichas de perfil en las que participo' }));
}

describe('ConsultarFichasParticipo', () => {
  beforeEach(() => {
    vi.mocked(useFichasParticipacion).mockReset();
    mockEstados([
      { id: 'APROBADA', nombre: 'Aprobada', descripcion: '' },
      { id: 'NO_APROBADA', nombre: 'No aprobada', descripcion: '' },
    ]);
  });

  it('muestra la insignia de la evaluación y el título abre el detalle con el estado de la ficha', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([FICHA]) });
    render(
      <>
        <ConsultarFichasParticipo />
        <EstadoDeNavegacion />
      </>,
      { initialPath: '/fichas-perfil?vista=participo' },
    );

    // Act
    await user.click(tabla().getByRole('link', { name: 'Abrir la ficha Sistema de monitoreo' }));

    // Assert
    expect(screen.getByText('1 ficha')).toBeInTheDocument();
    expect(tabla().getByText('Descartada')).toBeInTheDocument();
    expect(tabla().getByText('Disponible para evaluación')).toBeInTheDocument();
    const destino = screen.getByText(/^destino:/).textContent!;
    expect(destino).toContain('destino:/fichas-perfil/f-1/items:');
    const state = JSON.parse(destino.slice('destino:/fichas-perfil/f-1/items:'.length));
    expect(state.resumen.estadoId).toBe('DISPONIBLE_PARA_EVALUACION');
    expect(state.search).toBe('?vista=participo');
  });

  it('los chips de estado llaman a toggleEstado con el id del catálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([FICHA]) });
    render(<ConsultarFichasParticipo />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Aprobada' }));

    // Assert
    expect(hook.toggleEstado).toHaveBeenCalledWith('APROBADA');
  });

  it('sin catálogo de estados no ofrece los chips', () => {
    // Arrange
    mockEstados(undefined);
    mockHook({ data: crearPagina([FICHA]) });

    // Act
    render(<ConsultarFichasParticipo />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Aprobada' })).not.toBeInTheDocument();
  });

  it('vacío sin filtros ofrece «Ver fichas disponibles» que vuelve a la pestaña por defecto', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([]) });
    render(
      <>
        <ConsultarFichasParticipo />
        <EstadoDeNavegacion />
      </>,
      { initialPath: '/fichas-perfil?vista=participo' },
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver fichas disponibles' }));

    // Assert
    expect(screen.getByText('Aún no participas en ninguna ficha')).toBeInTheDocument();
    expect(screen.getByText(/^destino:\/fichas-perfil:/)).toBeInTheDocument();
  });

  it('vacío con filtros muestra «Sin resultados» y «Limpiar filtros» los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({
      data: crearPagina([]),
      filtros: { titulo: '', asesorNombre: '', asesorEmail: '', estadoIds: ['APROBADA'] },
    });
    render(<ConsultarFichasParticipo />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('muestra el error con «Reintentar» que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarFichasParticipo />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las fichas en las que participas',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });
});
