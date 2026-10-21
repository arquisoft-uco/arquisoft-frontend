import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstadoFichaPerfilAsesor } from '../models/EstadoFichaPerfilAsesor';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useHistorialEstadosFichaAsesor } from './useHistorialEstadosFichaAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEstadosFichasAsesor: vi.fn(),
  },
}));

const getEstadosFichasAsesor = vi.mocked(fichasPerfilService.getEstadosFichasAsesor);

function estado(estadoId: string, estadoNombre: string, fecha: string): EstadoFichaPerfilAsesor {
  return {
    fichaPerfilId: 'f-1',
    tituloProyecto: 'Proyecto',
    estadoId,
    estadoNombre,
    fechaActualizacion: fecha,
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

describe('useHistorialEstadosFichaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filtra por la ficha, pide el tamaño máximo sin ordenamiento y ordena del más reciente al más antiguo', async () => {
    // Arrange
    getEstadosFichasAsesor.mockResolvedValue({
      content: [
        estado('e-1', 'Creada', '2026-01-01T10:00:00'),
        estado('e-3', 'Aprobada', '2026-03-01T10:00:00'),
        estado('e-2', 'En revisión', '2026-02-01T10:00:00'),
      ],
      totalElements: 3,
      totalPages: 1,
      number: 0,
      size: 100,
    } as never);

    // Act
    const { result } = renderHook(() => useHistorialEstadosFichaAsesor('f-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosFichasAsesor).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 100,
      filtros: { tipo: 'PREDICADO', campo: 'fichaPerfil', operador: 'ES', valor: 'f-1' },
    });
    expect(result.current.data).toEqual([
      { id: 'e-3', nombre: 'Aprobada', fechaActualizacion: '2026-03-01T10:00:00' },
      { id: 'e-2', nombre: 'En revisión', fechaActualizacion: '2026-02-01T10:00:00' },
      { id: 'e-1', nombre: 'Creada', fechaActualizacion: '2026-01-01T10:00:00' },
    ]);
  });

  it('sin id de ficha no consulta el service', () => {
    // Act
    const { result } = renderHook(() => useHistorialEstadosFichaAsesor(''), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(getEstadosFichasAsesor).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });
});
