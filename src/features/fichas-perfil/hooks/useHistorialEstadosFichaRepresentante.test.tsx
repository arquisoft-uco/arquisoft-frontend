import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useHistorialEstadosFichaRepresentante } from './useHistorialEstadosFichaRepresentante';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEstadosFichaPerfilRepresentante: vi.fn(),
  },
}));

const getEstadosFichaPerfilRepresentante = vi.mocked(
  fichasPerfilService.getEstadosFichaPerfilRepresentante,
);

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useHistorialEstadosFichaRepresentante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la ficha y devuelve el historial del más reciente al más antiguo sin mutar la respuesta', async () => {
    // Arrange
    const respuesta = [
      { id: 'e-1', nombre: 'Creada', fechaActualizacion: '2026-01-01T10:00:00' },
      { id: 'e-2', nombre: 'En revisión', fechaActualizacion: '2026-02-01T10:00:00' },
      { id: 'e-3', nombre: 'Aprobada', fechaActualizacion: '2026-03-01T10:00:00' },
    ];
    const copia = [...respuesta];
    getEstadosFichaPerfilRepresentante.mockResolvedValue(respuesta);

    // Act
    const { result } = renderHook(() => useHistorialEstadosFichaRepresentante('f-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosFichaPerfilRepresentante).toHaveBeenCalledWith('f-1');
    expect(result.current.data?.map((e) => e.id)).toEqual(['e-3', 'e-2', 'e-1']);
    expect(respuesta).toEqual(copia);
  });

  it('sin id de ficha no consulta el service', () => {
    // Act
    const { result } = renderHook(() => useHistorialEstadosFichaRepresentante(''), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(getEstadosFichaPerfilRepresentante).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });
});
