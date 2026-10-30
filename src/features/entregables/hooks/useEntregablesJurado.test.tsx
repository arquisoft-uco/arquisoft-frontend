import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { EntregableProyectoGrado } from '../models/EntregableProyectoGrado';
import { entregablesService } from '../services/entregablesService';
import { useEntregablesJurado } from './useEntregablesJurado';

vi.mock('../services/entregablesService', () => ({
  entregablesService: {
    consultarEntregablesJurado: vi.fn(),
  },
}));

const consultar = vi.mocked(entregablesService.consultarEntregablesJurado);

const entregable: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 1,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'EN_EVALUACION', nombre: 'En Evaluacion' },
};

function crearPagina(numero: number): Page<EntregableProyectoGrado> {
  return {
    content: [entregable],
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

function montarEn(entrada = '/') {
  return renderHook(() => ({ hook: useEntregablesJurado(), url: useLocation().search }), {
    wrapper: crearWrapper(entrada),
  });
}

describe('useEntregablesJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina)));
  });

  it('consulta la página 0 ordenada por proyecto con desempate de versión y sin filtros', async () => {
    // Act
    const { result } = montarEn();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['proyectoGradoNombre:ASC', 'versionEntregable:DESC'],
      filtros: undefined,
    });
    expect(result.current.hook.data?.content).toEqual([entregable]);
  });

  it('buscar y fijar asesor vuelven a la página 0, arman el filtro AND y se reflejan en la URL', async () => {
    // Arrange
    const { result } = montarEn('/?pagina=2');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));
    expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 }));

    // Act
    act(() => result.current.hook.setTexto('  riego '));
    act(() => result.current.hook.setAsesor(' Ana '));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['proyectoGradoNombre:ASC', 'versionEntregable:DESC'],
        filtros: {
          tipo: 'GRUPO',
          conector: 'AND',
          nodos: [
            {
              tipo: 'PREDICADO',
              campo: 'proyectoGradoNombre',
              operador: 'CONTIENE',
              valor: 'riego',
            },
            { tipo: 'PREDICADO', campo: 'asesorNombre', operador: 'CONTIENE', valor: 'Ana' },
          ],
        },
      }),
    );
    expect(result.current.url).toContain('asesor=');
    expect(result.current.url).toContain('q=');
    expect(result.current.url).not.toContain('pagina');
  });

  it('setOrden por asesor usa sus dos desempates y el orden por defecto no se escribe en la URL', async () => {
    // Arrange
    const { result } = montarEn();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.setOrden('asesorNombre', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          ordenamiento: ['asesorNombre:DESC', 'proyectoGradoNombre:ASC', 'versionEntregable:DESC'],
        }),
      ),
    );
    expect(result.current.url).toContain('orden=asesorNombre%3ADESC');

    // Act
    act(() => result.current.hook.setOrden('proyectoGradoNombre', 'ASC'));

    // Assert
    await waitFor(() => expect(result.current.url).not.toContain('orden'));
  });

  it('limpiarFiltros borra búsqueda y asesor y conserva el orden', async () => {
    // Arrange
    const { result } = montarEn('/?q=riego&asesor=Ana&orden=versionEntregable%3ADESC');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['versionEntregable:DESC', 'proyectoGradoNombre:ASC'],
        filtros: undefined,
      }),
    );
    expect(result.current.hook.texto).toBe('');
    expect(result.current.hook.asesor).toBe('');
    expect(result.current.url).toContain('orden=versionEntregable%3ADESC');
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
