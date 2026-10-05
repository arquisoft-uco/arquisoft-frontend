import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { FichaPerfil } from '../models/FichaPerfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { construirFiltroTitulo, useFichasPerfilCoordinador } from './useFichasPerfilCoordinador';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getFichasCoordinador: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.getFichasCoordinador);

const ficha: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
};

function crearPagina(numero: number, content: FichaPerfil[]): Page<FichaPerfil> {
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

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

async function montar() {
  const { result } = renderHook(() => useFichasPerfilCoordinador(), { wrapper: crearWrapper() });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  return result;
}

describe('construirFiltroTitulo', () => {
  it('devuelve undefined con texto vacío y un predicado CONTIENE recortado con texto', () => {
    // Act / Assert
    expect(construirFiltroTitulo('   ')).toBeUndefined();
    expect(construirFiltroTitulo('  monitoreo ')).toEqual({
      tipo: 'PREDICADO',
      campo: 'tituloProyecto',
      operador: 'CONTIENE',
      valor: 'monitoreo',
    });
  });
});

describe('useFichasPerfilCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina, [ficha])));
  });

  it('consulta la página 0 con orden por título ascendente y sin filtros', async () => {
    // Act
    const result = await montar();

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['tituloProyecto:ASC'],
      filtros: undefined,
    });
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.data?.content).toEqual([ficha]);
  });

  it('goToPage consulta la página pedida', async () => {
    // Arrange
    const result = await montar();

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 })),
    );
    expect(result.current.page).toBe(1);
  });

  it('la búsqueda se envía recortada y vuelve a la página 0', async () => {
    // Arrange
    const result = await montar();
    act(() => result.current.goToPage(1));
    await waitFor(() => expect(result.current.page).toBe(1));

    // Act
    act(() => result.current.setTexto('  monitoreo '));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['tituloProyecto:ASC'],
        filtros: {
          tipo: 'PREDICADO',
          campo: 'tituloProyecto',
          operador: 'CONTIENE',
          valor: 'monitoreo',
        },
      }),
    );
    expect(result.current.page).toBe(0);
    expect(result.current.texto).toBe('  monitoreo ');
  });

  it('setOrden cambia campo y dirección y vuelve a la página 0', async () => {
    // Arrange
    const result = await montar();
    act(() => result.current.goToPage(1));
    await waitFor(() => expect(result.current.page).toBe(1));

    // Act
    act(() => result.current.setOrden('asesorNombre', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagina: 0, ordenamiento: ['asesorNombre:DESC'] }),
      ),
    );
    expect(result.current.ordenCampo).toBe('asesorNombre');
    expect(result.current.ordenDireccion).toBe('DESC');
  });

  it('limpiarFiltros vacía la búsqueda y conserva el orden', async () => {
    // Arrange
    const result = await montar();
    act(() => result.current.setOrden('asesorNombre', 'DESC'));
    act(() => result.current.setTexto('monitoreo'));
    await waitFor(() => expect(result.current.texto).toBe('monitoreo'));

    // Act
    act(() => result.current.limpiarFiltros());

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['asesorNombre:DESC'],
        filtros: undefined,
      }),
    );
    expect(result.current.texto).toBe('');
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useFichasPerfilCoordinador(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
