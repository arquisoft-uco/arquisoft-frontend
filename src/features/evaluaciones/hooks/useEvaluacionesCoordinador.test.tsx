import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Evaluacion } from '../models/Evaluacion';
import { evaluacionesService } from '../services/evaluacionesService';
import { construirFiltros, useEvaluacionesCoordinador } from './useEvaluacionesCoordinador';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    getEvaluacionesCoordinador: vi.fn(),
  },
}));

const consultar = vi.mocked(evaluacionesService.getEvaluacionesCoordinador);

const evaluacion: Evaluacion = {
  id: 'e-1',
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 1 },
  estado: { id: 'PENDIENTE', nombre: 'Pendiente' },
};

function crearPagina(numero: number, content: Evaluacion[]): Page<Evaluacion> {
  return {
    content,
    page: numero,
    size: 10,
    totalElements: 12,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: content.length === 0,
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

function montarEn(entrada = '/') {
  return renderHook(() => ({ hook: useEvaluacionesCoordinador(), url: useLocation().search }), {
    wrapper: crearWrapper(entrada),
  });
}

describe('construirFiltros', () => {
  it('combina el proyecto y los estados según lo que haya', () => {
    // Arrange
    const proyecto = {
      tipo: 'PREDICADO',
      campo: 'proyecto',
      operador: 'CONTIENE',
      valor: 'monitoreo',
    };
    const estados = {
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estado',
      operador: 'IN',
      valores: ['PENDIENTE', 'EN_PROGRESO'],
    };

    // Act / Assert
    expect(construirFiltros('   ', [])).toBeUndefined();
    expect(construirFiltros('  monitoreo ', [])).toEqual(proyecto);
    expect(construirFiltros('', ['PENDIENTE', 'EN_PROGRESO'])).toEqual(estados);
    expect(construirFiltros('monitoreo', ['PENDIENTE', 'EN_PROGRESO'])).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [proyecto, estados],
    });
  });
});

describe('useEvaluacionesCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) =>
      Promise.resolve(crearPagina(pagina, [evaluacion])),
    );
  });

  it('consulta la página 0 con orden por proyecto ascendente y sin filtros', async () => {
    // Act
    const { result } = montarEn();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['proyecto:ASC'],
      filtros: undefined,
    });
    expect(result.current.hook.data?.content).toEqual([evaluacion]);
  });

  it('buscar y alternar un estado vuelven a la página 0 y se reflejan en la URL', async () => {
    // Arrange
    const { result } = montarEn('/?pagina=2');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));
    expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 }));

    // Act
    act(() => result.current.hook.setTexto('  monitoreo '));
    act(() => result.current.hook.toggleEstado('EN_PROGRESO'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['proyecto:ASC'],
        filtros: {
          tipo: 'GRUPO',
          conector: 'AND',
          nodos: [
            { tipo: 'PREDICADO', campo: 'proyecto', operador: 'CONTIENE', valor: 'monitoreo' },
            {
              tipo: 'PREDICADO_MULTIVALOR',
              campo: 'estado',
              operador: 'IN',
              valores: ['EN_PROGRESO'],
            },
          ],
        },
      }),
    );
    expect(result.current.url).toContain('estado=EN_PROGRESO');
    expect(result.current.url).not.toContain('pagina');
  });

  it('ordenar por estado descendente consulta ordenado y el orden por defecto no queda en la URL', async () => {
    // Arrange
    const { result } = montarEn();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.setOrden('estado', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordenamiento: ['estado:DESC'] }),
      ),
    );
    expect(result.current.url).toContain('orden=');

    // Act
    act(() => result.current.hook.setOrden('proyecto', 'ASC'));

    // Assert
    await waitFor(() => expect(result.current.url).not.toContain('orden'));
  });

  it('limpiarFiltros quita búsqueda y estados', async () => {
    // Arrange
    const { result } = montarEn('/?q=monitoreo&estado=PENDIENTE');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ filtros: undefined })),
    );
    expect(result.current.hook.texto).toBe('');
    expect(result.current.hook.estadoIds).toEqual([]);
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = montarEn();

    // Assert
    await waitFor(() => expect(result.current.hook.isError).toBe(true));
    expect(result.current.hook.data).toBeUndefined();
  });
});
