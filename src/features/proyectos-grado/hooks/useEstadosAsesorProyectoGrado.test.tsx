import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstadoAsesorProyectoGrado } from '../models/EstadoAsesorProyectoGrado';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useEstadosAsesorProyectoGrado } from './useEstadosAsesorProyectoGrado';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getEstadosAsesor: vi.fn(),
  },
}));

const getEstadosAsesor = vi.mocked(proyectosGradoService.getEstadosAsesor);

const ESTADOS: EstadoAsesorProyectoGrado[] = [
  { id: 'ASIGNADO', nombre: 'Asignado', descripcion: 'El asesor está actualmente activo.' },
  { id: 'FINALIZADO', nombre: 'Finalizado', descripcion: 'El asesor ha concluido.' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosAsesorProyectoGrado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta getEstadosAsesor una vez y expone el catálogo en data', async () => {
    // Arrange
    getEstadosAsesor.mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosAsesorProyectoGrado(), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosAsesor).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(ESTADOS);
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getEstadosAsesor.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosAsesorProyectoGrado(), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
