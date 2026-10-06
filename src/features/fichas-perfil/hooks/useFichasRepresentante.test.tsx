import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocation } from 'react-router';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichasRepresentante } from './useFichasRepresentante';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getFichasRepresentante: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.getFichasRepresentante);

const VACIOS = { titulo: '', asesorNombre: '', asesorEmail: '', estadoIds: [] };

const ficha: FichaPerfilRepresentante = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  asesorNombre: 'Ana Ruiz',
  asesorEmail: 'ana@uco.edu.co',
  estadoId: 'st-1',
  estadoActual: 'Aprobada',
  estadoFechaActualizacion: '2026-09-01T10:00:00',
};

function crearPagina(
  numero: number,
  content: FichaPerfilRepresentante[],
): Page<FichaPerfilRepresentante> {
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

async function montar() {
  const { result } = renderHook(() => useFichasRepresentante(), { wrapper: crearWrapper() });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  return result;
}

describe('useFichasRepresentante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((page) => Promise.resolve(crearPagina(page, [ficha])));
  });

  it('consulta la página 0 sin filtros y con orden por título ascendente', async () => {
    // Act
    const result = await montar();

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10, VACIOS, ['tituloProyecto:ASC']);
    expect(result.current.filtros).toEqual(VACIOS);
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.data?.content).toEqual([ficha]);
  });

  it('goToPage consulta la página pedida con los mismos filtros', async () => {
    // Arrange
    const result = await montar();

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(1, 10, VACIOS, ['tituloProyecto:ASC']),
    );
  });

  it('combina título, asesor, correo y estados, y cada setter vuelve a la página 0', async () => {
    // Arrange
    const result = await montar();
    async function desdePagina1(cambio: () => void) {
      act(() => result.current.goToPage(1));
      await waitFor(() => expect(result.current.page).toBe(1));
      act(cambio);
      expect(result.current.page).toBe(0);
    }

    // Act
    await desdePagina1(() => result.current.setTitulo(' monitoreo '));
    await desdePagina1(() => result.current.setAsesorNombre('Ana'));
    await desdePagina1(() => result.current.setAsesorEmail('ana@'));
    await desdePagina1(() => result.current.toggleEstado('st-1'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        0,
        10,
        { titulo: 'monitoreo', asesorNombre: 'Ana', asesorEmail: 'ana@', estadoIds: ['st-1'] },
        ['tituloProyecto:ASC'],
      ),
    );
  });

  it('toggleEstado agrega y quita, y limpiarEstados vacía la selección', async () => {
    // Arrange
    const result = await montar();

    // Act
    act(() => result.current.toggleEstado('st-1'));
    act(() => result.current.toggleEstado('st-2'));
    act(() => result.current.toggleEstado('st-1'));
    const tras = result.current.filtros.estadoIds;
    act(() => result.current.limpiarEstados());

    // Assert
    expect(tras).toEqual(['st-2']);
    expect(result.current.filtros.estadoIds).toEqual([]);
  });

  it('setOrden cambia el campo y la dirección y vuelve a la página 0', async () => {
    // Arrange
    const result = await montar();
    act(() => result.current.goToPage(1));
    await waitFor(() => expect(result.current.page).toBe(1));

    // Act
    act(() => result.current.setOrden('asesorNombre', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(0, 10, VACIOS, ['asesorNombre:DESC']),
    );
    expect(result.current.ordenCampo).toBe('asesorNombre');
    expect(result.current.ordenDireccion).toBe('DESC');
  });

  it('limpiarFiltros restablece todos los filtros', async () => {
    // Arrange
    const result = await montar();
    act(() => result.current.setTitulo('x'));
    act(() => result.current.toggleEstado('st-1'));

    // Act
    act(() => result.current.limpiarFiltros());

    // Assert
    expect(result.current.filtros).toEqual(VACIOS);
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useFichasRepresentante(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('useFichasRepresentante con la URL como estado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((page) => Promise.resolve(crearPagina(page, [ficha])));
  });

  it('traduce q, asesor, correo, estado repetido, orden y pagina de la URL', async () => {
    // Act
    const { result } = renderHook(() => useFichasRepresentante(), {
      wrapper: crearWrapper(
        '/?q=monitoreo&asesor=Ana&correo=ana@&estado=st-1&estado=st-2&orden=asesorNombre:DESC&pagina=3',
      ),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      2,
      10,
      {
        titulo: 'monitoreo',
        asesorNombre: 'Ana',
        asesorEmail: 'ana@',
        estadoIds: ['st-1', 'st-2'],
      },
      ['asesorNombre:DESC'],
    );
  });

  it('toggleEstado repite el parámetro, limpiarFiltros lo quita y el cambio borra pagina', async () => {
    // Arrange
    const { result } = renderHook(
      () => ({ hook: useFichasRepresentante(), url: useLocation().search }),
      { wrapper: crearWrapper('/?pagina=2') },
    );
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.toggleEstado('st-1'));
    act(() => result.current.hook.toggleEstado('st-2'));

    // Assert
    expect(result.current.url).toBe('?estado=st-1&estado=st-2');

    // Act
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    expect(result.current.url).toBe('');
  });
});
