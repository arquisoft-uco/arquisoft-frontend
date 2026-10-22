import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { EvaluacionFichaPerfilAsesor } from '../models/EvaluacionFichaPerfilAsesor';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useEvaluacionesFichasAsesor } from './useEvaluacionesFichasAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    consultarEvaluacionesFichasAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.consultarEvaluacionesFichasAsesor);

const evaluacion: EvaluacionFichaPerfilAsesor = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  fechaCreacion: '2026-09-01T10:00:00Z',
  estadoEvaluacionId: 'APROBADA',
  estadoEvaluacionNombre: 'Aprobada',
  representante: { id: 'r-1', nombre: 'Luis Gómez' },
};

function crearPagina(numero: number): Page<EvaluacionFichaPerfilAsesor> {
  return {
    content: [evaluacion],
    page: numero,
    size: 10,
    totalElements: 12,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: false,
  };
}

function crearWrapper(entrada = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[entrada]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function renderizar(entrada = '/') {
  return renderHook(() => ({ hook: useEvaluacionesFichasAsesor(), url: useLocation().search }), {
    wrapper: crearWrapper(entrada),
  });
}

describe('useEvaluacionesFichasAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((req) => Promise.resolve(crearPagina(req.pagina ?? 0)));
  });

  it('en el primer render consulta la página 0, tamaño 10, la más reciente primero y sin filtros', async () => {
    // Arrange / Act
    const { result } = renderizar();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaCreacion:DESC'],
      filtros: undefined,
    });
    expect(result.current.hook.data?.content).toEqual([evaluacion]);
    expect(result.current.hook.page).toBe(0);
    expect(result.current.hook.pageSize).toBe(10);
  });

  it('con ?q envía el predicado tituloProyecto CONTIENE recortado y con un orden inválido usa el de por defecto', async () => {
    // Arrange / Act
    const { result } = renderizar('/?q=%20sis%20&orden=raro:ASC');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaCreacion:DESC'],
      filtros: { tipo: 'PREDICADO', campo: 'tituloProyecto', operador: 'CONTIENE', valor: 'sis' },
    });
  });

  it('setOrden y setTexto escriben en la URL y vuelven a la página 1; el orden por defecto se quita', async () => {
    // Arrange
    const { result } = renderizar('/?pagina=3');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.setOrden('tituloProyecto', 'ASC'));

    // Assert
    expect(result.current.url).toBe('?orden=tituloProyecto%3AASC');
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagina: 0, ordenamiento: ['tituloProyecto:ASC'] }),
      ),
    );

    // Act
    act(() => result.current.hook.setTexto('mon'));

    // Assert
    expect(result.current.url).toContain('q=mon');
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtros: expect.objectContaining({ valor: 'mon' }),
        }),
      ),
    );

    // Act
    act(() => result.current.hook.setOrden('fechaCreacion', 'DESC'));

    // Assert
    expect(result.current.url).not.toContain('orden');
  });

  it('goToPage escribe la página 1-based en la URL y vuelve a consultar', async () => {
    // Arrange
    const { result } = renderizar();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.goToPage(1));

    // Assert
    expect(result.current.url).toBe('?pagina=2');
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 })),
    );
  });

  it('limpiarFiltros quita la búsqueda de la URL', async () => {
    // Arrange
    const { result } = renderizar('/?q=sis');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    expect(result.current.url).toBe('');
    expect(result.current.hook.texto).toBe('');
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderizar();

    // Assert
    await waitFor(() => expect(result.current.hook.isError).toBe(true));
    expect(result.current.hook.data).toBeUndefined();
  });
});
