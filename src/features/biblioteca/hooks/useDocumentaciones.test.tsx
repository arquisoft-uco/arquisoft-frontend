import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Documentacion } from '../models/Documentacion';
import { bibliotecaService } from '../services/bibliotecaService';
import { useDocumentaciones } from './useDocumentaciones';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: {
    consultarDocumentaciones: vi.fn(),
  },
}));

const consultar = vi.mocked(bibliotecaService.consultarDocumentaciones);

const documentacion: Documentacion = {
  id: 'd-1',
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 1 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};

function crearPagina(numero: number): Page<Documentacion> {
  return {
    content: [documentacion],
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

function montarEn(filtraPorEstado: boolean, entrada = '/') {
  return renderHook(
    () => ({ hook: useDocumentaciones(filtraPorEstado), url: useLocation().search }),
    { wrapper: crearWrapper(entrada) },
  );
}

describe('useDocumentaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina)));
  });

  it('consulta la página 0 ordenada por fecha descendente y sin filtros', async () => {
    // Act
    const { result } = montarEn(true);
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['fechaPublicacion:DESC'],
      filtros: undefined,
    });
    expect(result.current.hook.data?.content).toEqual([documentacion]);
  });

  it('alternar un estado vuelve a la página 0, queda en la URL y envía el filtro IN', async () => {
    // Arrange
    const { result } = montarEn(true, '/?pagina=2');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));
    expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 }));

    // Act
    act(() => result.current.hook.toggleEstado('PENDIENTE'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['fechaPublicacion:DESC'],
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoDocumentacion',
          operador: 'IN',
          valores: ['PENDIENTE'],
        },
      }),
    );
    expect(result.current.url).toContain('estado=PENDIENTE');
    expect(result.current.url).not.toContain('pagina');
  });

  it('sin permiso para filtrar ignora un ?estado= de la URL', async () => {
    // Act
    const { result } = montarEn(false, '/?estado=PENDIENTE');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(result.current.hook.estadoIds).toEqual([]);
    expect(consultar).toHaveBeenCalledWith(expect.objectContaining({ filtros: undefined }));
  });

  it('setOrden ASC queda en la URL y limpiarFiltros quita los estados sin tocar el orden', async () => {
    // Arrange
    const { result } = montarEn(true, '/?estado=PENDIENTE');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.setOrden('ASC'));
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['fechaPublicacion:ASC'],
        filtros: undefined,
      }),
    );
    expect(result.current.hook.ordenDireccion).toBe('ASC');
    expect(result.current.url).toContain('orden=fechaPublicacion%3AASC');
    expect(result.current.url).not.toContain('estado');
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = montarEn(true);

    // Assert
    await waitFor(() => expect(result.current.hook.isError).toBe(true));
    expect(result.current.hook.data).toBeUndefined();
  });
});
