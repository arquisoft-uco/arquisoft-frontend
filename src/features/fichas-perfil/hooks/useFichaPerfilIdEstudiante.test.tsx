import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    consultarFichasPerfilEstudiante: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.consultarFichasPerfilEstudiante);

function crearFicha(id: string) {
  return {
    id,
    tituloProyecto: `Proyecto ${id}`,
    asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
    estadoActual: { id: 'st-1', nombre: 'En revisión', fechaActualizacion: '2026-09-01T10:00:00' },
    integrantes: [],
  };
}

function crearWrapper(ruta = '/fichas-perfil') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function usarConUbicacion() {
  return { ...useFichaPerfilIdEstudiante(), search: useLocation().search };
}

describe('useFichaPerfilIdEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve null sin fichas y la única ficha cuando hay una', async () => {
    // Arrange
    consultar.mockResolvedValueOnce([]);
    const vacio = renderHook(() => useFichaPerfilIdEstudiante(), { wrapper: crearWrapper() });
    await waitFor(() => expect(vacio.result.current.isLoading).toBe(false));
    consultar.mockResolvedValueOnce([crearFicha('f-1')]);

    // Act
    const unica = renderHook(() => useFichaPerfilIdEstudiante(), { wrapper: crearWrapper() });
    await waitFor(() => expect(unica.result.current.fichaPerfilId).toBe('f-1'));

    // Assert
    expect(vacio.result.current.fichaPerfilId).toBeNull();
    expect(vacio.result.current.ficha).toBeNull();
  });

  it('reexpone isSuccess solo con la consulta resuelta y refetch vuelve a pedir las fichas', async () => {
    // Arrange
    consultar.mockResolvedValue([crearFicha('f-1')]);
    const { result } = renderHook(() => useFichaPerfilIdEstudiante(), { wrapper: crearWrapper() });
    expect(result.current.isSuccess).toBe(false);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    await act(() => result.current.refetch());

    // Assert
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('con varias fichas usa ?ficha= válido, la primera si falta o es inválido, y seleccionarFicha escribe el param', async () => {
    // Arrange
    consultar.mockResolvedValue([crearFicha('f-1'), crearFicha('f-2')]);

    // Act
    const conParam = renderHook(() => useFichaPerfilIdEstudiante(), {
      wrapper: crearWrapper('/fichas-perfil?ficha=f-2'),
    });
    const invalido = renderHook(() => useFichaPerfilIdEstudiante(), {
      wrapper: crearWrapper('/fichas-perfil?ficha=zzz'),
    });
    const sinParam = renderHook(usarConUbicacion, { wrapper: crearWrapper() });
    await waitFor(() => expect(sinParam.result.current.fichas).toHaveLength(2));
    act(() => sinParam.result.current.seleccionarFicha('f-2'));

    // Assert
    await waitFor(() => expect(conParam.result.current.fichaPerfilId).toBe('f-2'));
    await waitFor(() => expect(invalido.result.current.fichaPerfilId).toBe('f-1'));
    expect(sinParam.result.current.search).toBe('?ficha=f-2');
    expect(sinParam.result.current.fichaPerfilId).toBe('f-2');
  });

  it('expone isError y ninguna ficha cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValueOnce(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useFichaPerfilIdEstudiante(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.fichaPerfilId).toBeNull();
    expect(result.current.fichas).toEqual([]);
  });

  it('dos consumidores montados provocan una sola llamada al service', async () => {
    // Arrange
    consultar.mockResolvedValue([crearFicha('f-1')]);

    // Act
    const { result } = renderHook(
      () => ({ a: useFichaPerfilIdEstudiante(), b: useFichaPerfilIdEstudiante() }),
      { wrapper: crearWrapper() },
    );
    await waitFor(() => expect(result.current.b.fichaPerfilId).toBe('f-1'));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
