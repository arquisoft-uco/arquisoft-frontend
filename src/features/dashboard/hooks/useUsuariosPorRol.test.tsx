import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ROLES_CONTABLES, dashboardService } from '../services/dashboardService';
import { useUsuariosPorRol } from './useUsuariosPorRol';

vi.mock('../services/dashboardService', async () => {
  const { Rol } = await import('../../../shared/models/rol');
  return {
    ROLES_CONTABLES: [Rol.Estudiante, Rol.Asesor, Rol.Administrador],
    dashboardService: { contarUsuarios: vi.fn() },
  };
});

const contar = vi.mocked(dashboardService.contarUsuarios);

function envoltorio({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useUsuariosPorRol', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve una fila por rol contable con el total de usuarios vigentes', async () => {
    contar.mockImplementation(async ({ rol }) => ROLES_CONTABLES.indexOf(rol!) + 10);

    const { result } = renderHook(() => useUsuariosPorRol(), { wrapper: envoltorio });

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.filas.map((f) => f.total)).toEqual([10, 11, 12]);
    expect(result.current.hayError).toBe(false);
    expect(contar).toHaveBeenCalledWith({ vigente: true, rol: ROLES_CONTABLES[0] });
  });

  it('con una consulta fallida deja ese total en undefined y reintentar vuelve a pedir solo esa', async () => {
    // Arrange
    contar.mockImplementation(async ({ rol }) => {
      if (rol === ROLES_CONTABLES[1]) throw new Error('fallo');
      return 5;
    });
    const { result } = renderHook(() => useUsuariosPorRol(), { wrapper: envoltorio });
    await waitFor(() => expect(result.current.hayError).toBe(true));
    expect(result.current.filas.map((f) => f.total)).toEqual([5, undefined, 5]);
    contar.mockClear();
    contar.mockResolvedValue(8);

    // Act
    act(() => result.current.reintentar());

    // Assert
    await waitFor(() => expect(result.current.hayError).toBe(false));
    expect(contar).toHaveBeenCalledTimes(1);
    expect(result.current.filas.map((f) => f.total)).toEqual([5, 8, 5]);
  });
});
