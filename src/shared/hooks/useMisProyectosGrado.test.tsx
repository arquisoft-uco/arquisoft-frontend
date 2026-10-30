import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { misProyectosGradoService } from '../services/misProyectosGradoService';
import { useMisProyectosGrado } from './useMisProyectosGrado';

vi.mock('../services/misProyectosGradoService', () => ({
  misProyectosGradoService: { consultar: vi.fn() },
}));

const consultar = vi.mocked(misProyectosGradoService.consultar);

function crearProyecto(id: string) {
  return {
    id,
    fichaPerfil: `ficha-${id}`,
    tituloProyecto: `Proyecto ${id}`,
    estado: { id: 'EN_CURSO', nombre: 'En curso' },
  };
}

function crearWrapper(ruta = '/proyectos-grado') {
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
  return { ...useMisProyectosGrado(), search: useLocation().search };
}

describe('useMisProyectosGrado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con varios proyectos usa ?proyecto= válido, el primero si falta o es desconocido, y seleccionarProyecto conserva otros params', async () => {
    // Arrange
    consultar.mockResolvedValue([crearProyecto('p-1'), crearProyecto('p-2')]);

    // Act
    const conParam = renderHook(() => useMisProyectosGrado(), {
      wrapper: crearWrapper('/proyectos-grado?proyecto=p-2'),
    });
    const desconocido = renderHook(() => useMisProyectosGrado(), {
      wrapper: crearWrapper('/proyectos-grado?proyecto=zzz'),
    });
    const sinParam = renderHook(usarConUbicacion, {
      wrapper: crearWrapper('/proyectos-grado?otro=1&pagina=3'),
    });
    await waitFor(() => expect(sinParam.result.current.proyectos).toHaveLength(2));
    expect(sinParam.result.current.proyecto?.id).toBe('p-1');
    act(() => sinParam.result.current.seleccionarProyecto('p-2'));

    // Assert
    await waitFor(() => expect(conParam.result.current.proyecto?.id).toBe('p-2'));
    await waitFor(() => expect(desconocido.result.current.proyecto?.id).toBe('p-1'));
    expect(sinParam.result.current.search).toBe('?otro=1&proyecto=p-2');
    expect(sinParam.result.current.proyecto?.id).toBe('p-2');
  });

  it('una lista vacía activa sinProyecto', async () => {
    // Arrange
    consultar.mockResolvedValue([]);

    // Act
    const { result } = renderHook(() => useMisProyectosGrado(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(result.current.sinProyecto).toBe(true);
    expect(result.current.proyecto).toBeNull();
  });

  it('un error activa hayError y reintentar vuelve a consultar', async () => {
    // Arrange
    consultar.mockRejectedValueOnce(new Error('fallo de red'));
    const { result } = renderHook(() => useMisProyectosGrado(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.hayError).toBe(true));
    consultar.mockResolvedValue([crearProyecto('p-1')]);

    // Act
    await act(() => result.current.reintentar());

    // Assert
    await waitFor(() => expect(result.current.cargado).toBe(true));
    expect(consultar).toHaveBeenCalledTimes(2);
    expect(result.current.hayError).toBe(false);
  });
});
