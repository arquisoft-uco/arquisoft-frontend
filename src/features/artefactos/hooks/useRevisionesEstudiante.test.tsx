import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { construirFiltrosRevisiones } from '../utils/filtros-revisiones-estudiante';
import { useRevisionesEstudiante } from './useRevisionesEstudiante';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarRevisionesEstudiante: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarRevisionesEstudiante);
const getEstados = vi.mocked(artefactosService.getEstadosRevisionAsesor);

const PAGINA_VACIA = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

function crearWrapper(ruta = '/artefactos') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useRevisionesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    getEstados.mockResolvedValue([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'EN_PROGRESO', nombre: 'En progreso', descripcion: '' },
    ]);
  });

  it('por defecto consulta 10 por página, fechaCreacion:DESC y excluye PENDIENTE', async () => {
    // Act
    const { result } = renderHook(() => useRevisionesEstudiante(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaCreacion:DESC'],
      filtros: construirFiltrosRevisiones({ texto: '', desde: '', hasta: '', estadoIds: [] }),
    });
    expect(result.current.hayFiltros).toBe(false);
  });

  it('opcionesEstado no incluye PENDIENTE', async () => {
    // Act
    const { result } = renderHook(() => useRevisionesEstudiante(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() =>
      expect(result.current.opcionesEstado).toEqual([
        { id: 'EN_PROGRESO', etiqueta: 'En progreso' },
      ]),
    );
  });

  it('setOrden y setTexto actualizan la consulta', async () => {
    // Arrange
    const { result } = renderHook(() => useRevisionesEstudiante(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setOrden('version', 'ASC'));
    act(() => result.current.setTexto('acta'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['version:ASC'],
        filtros: construirFiltrosRevisiones({
          texto: 'acta',
          desde: '',
          hasta: '',
          estadoIds: [],
        }),
      }),
    );
    expect(result.current.hayFiltros).toBe(true);
  });
});
