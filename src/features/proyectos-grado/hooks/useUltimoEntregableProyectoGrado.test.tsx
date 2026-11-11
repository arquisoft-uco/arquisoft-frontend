import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useUltimoEntregableProyectoGrado } from './useUltimoEntregableProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    consultarUltimoEntregable: vi.fn(),
  },
}));

const consultar = vi.mocked(proyectosGradoService.consultarUltimoEntregable);

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUltimoEntregableProyectoGrado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone el último entregable del proyecto', async () => {
    // Arrange
    const ultimo = { versionEntregable: 2, estadoEntregable: { id: 'CERRADO', nombre: 'Cerrado' } };
    consultar.mockResolvedValue(ultimo);

    // Act
    const { result } = renderHook(() => useUltimoEntregableProyectoGrado('p-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(result.current.data).toEqual(ultimo);
  });

  it('no consulta sin id de proyecto', () => {
    // Act
    renderHook(() => useUltimoEntregableProyectoGrado(''), { wrapper: crearWrapper() });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });
});
