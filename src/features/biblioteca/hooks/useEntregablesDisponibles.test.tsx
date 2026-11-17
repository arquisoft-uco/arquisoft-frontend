import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { EntregableDisponible } from '../models/EntregableDisponible';
import { bibliotecaService } from '../services/bibliotecaService';
import { useEntregablesDisponibles } from './useEntregablesDisponibles';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: {
    consultarEntregablesDisponibles: vi.fn(),
  },
}));

const consultar = vi.mocked(bibliotecaService.consultarEntregablesDisponibles);

const entregable: EntregableDisponible = {
  id: 'e-1',
  proyectoGrado: 'p-1',
  tituloProyecto: 'Análisis de riego',
  versionEntregable: 2,
  nombreArchivo: 'informe.pdf',
  autores: [{ id: 'a-1', identificador: 'ana', nombre: 'Ana Pérez' }],
};

function crearPagina(numero: number): Page<EntregableDisponible> {
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

function montarEn(entrada = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[entrada]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  return renderHook(() => ({ hook: useEntregablesDisponibles(), url: useLocation().search }), {
    wrapper: Wrapper,
  });
}

describe('useEntregablesDisponibles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina)));
  });

  it('recorta el texto de ?q= antes de enviarlo como titulo', async () => {
    // Act
    const { result } = montarEn('/?q=%20%20an%C3%A1lisis%20');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({ pagina: 0, tamanio: 10, titulo: 'análisis' });
  });

  it('goToPage consulta la página pedida y setTexto vuelve a la primera dejando q en la URL', async () => {
    // Arrange
    const { result } = montarEn();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 })),
    );

    // Act
    act(() => result.current.hook.setTexto('riego'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({ pagina: 0, tamanio: 10, titulo: 'riego' }),
    );
    expect(result.current.url).toContain('q=riego');
    expect(result.current.url).not.toContain('pagina');
  });

  it('limpiarFiltros quita q de la URL y consulta sin titulo', async () => {
    // Arrange
    const { result } = montarEn('/?q=riego');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({ pagina: 0, tamanio: 10, titulo: undefined }),
    );
    expect(result.current.url).not.toContain('q=');
    expect(result.current.hook.data?.content).toEqual([entregable]);
  });
});
