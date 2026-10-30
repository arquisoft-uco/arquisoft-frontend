import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { EntregableProyectoGrado } from '../models/EntregableProyectoGrado';
import { entregablesService } from '../services/entregablesService';
import { useEntregablesEstudiante } from './useEntregablesEstudiante';

vi.mock('../services/entregablesService', () => ({
  entregablesService: {
    consultarEntregablesEstudiante: vi.fn(),
  },
}));

const consultar = vi.mocked(entregablesService.consultarEntregablesEstudiante);

const entregable: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 1,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
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
  return renderHook(() => ({ hook: useEntregablesEstudiante('p-1'), url: useLocation().search }), {
    wrapper: crearWrapper(entrada),
  });
}

describe('useEntregablesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((_id, { pagina }) => Promise.resolve(crearPagina(pagina)));
  });

  it('consulta el proyecto en la página 0, por versión descendente, sin filtros', async () => {
    // Act
    const { result } = montarEn();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1', {
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['versionEntregable:DESC', 'asesorNombre:ASC'],
    });
    expect(result.current.hook.data?.content).toEqual([entregable]);
  });

  it('setOrden actualiza el criterio con su desempate, vuelve a la página 0 y el orden por defecto no se escribe', async () => {
    // Arrange
    const { result } = montarEn('/?pagina=2');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));
    expect(consultar).toHaveBeenLastCalledWith('p-1', expect.objectContaining({ pagina: 1 }));

    // Act
    act(() => result.current.hook.setOrden('asesorNombre', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith('p-1', {
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['asesorNombre:DESC', 'versionEntregable:DESC'],
      }),
    );
    expect(result.current.url).toContain('orden=asesorNombre%3ADESC');
    expect(result.current.url).not.toContain('pagina');

    // Act
    act(() => result.current.hook.setOrden('versionEntregable', 'DESC'));

    // Assert
    await waitFor(() => expect(result.current.url).not.toContain('orden'));
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
