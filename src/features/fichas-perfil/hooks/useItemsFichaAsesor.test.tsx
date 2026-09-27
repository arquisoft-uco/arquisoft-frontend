import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Item } from '../models/fichas-perfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getItemsFichaAsesor: vi.fn(),
  },
}));

const getItemsFichaAsesor = vi.mocked(fichasPerfilService.getItemsFichaAsesor);

const ITEM_1: Item = {
  id: 'i-1',
  tipoItem: { id: 't-1', nombre: 'Habilidad técnica' },
  contenido: 'React y TypeScript',
  fichaPerfilId: 'f-1',
};

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useItemsFichaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con un fichaPerfilId no vacío, consulta getItemsFichaAsesor y expone los ítems en data', async () => {
    // Arrange
    getItemsFichaAsesor.mockResolvedValue([ITEM_1]);

    // Act
    const { result } = renderHook(() => useItemsFichaAsesor('f-1'), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getItemsFichaAsesor).toHaveBeenCalledWith('f-1');
    expect(result.current.data).toEqual([ITEM_1]);
  });

  it('con fichaPerfilId vacío, queda deshabilitado y no llama al service', () => {
    // Act
    const { result } = renderHook(() => useItemsFichaAsesor(''), { wrapper: crearWrapper() });

    // Assert
    expect(result.current.fetchStatus).toBe('idle');
    expect(getItemsFichaAsesor).not.toHaveBeenCalled();
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getItemsFichaAsesor.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useItemsFichaAsesor('f-1'), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
