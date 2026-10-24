import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Item } from '../models/fichas-perfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useItemsFichaRepresentante } from './useItemsFichaRepresentante';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getItemsFichaRepresentante: vi.fn(),
  },
}));

const getItemsFichaRepresentante = vi.mocked(fichasPerfilService.getItemsFichaRepresentante);

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

describe('useItemsFichaRepresentante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con un fichaPerfilId no vacío, consulta getItemsFichaRepresentante y expone los ítems en data', async () => {
    // Arrange
    getItemsFichaRepresentante.mockResolvedValue([ITEM_1]);

    // Act
    const { result } = renderHook(() => useItemsFichaRepresentante('f-1'), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getItemsFichaRepresentante).toHaveBeenCalledWith('f-1');
    expect(result.current.data).toEqual([ITEM_1]);
  });

  it('con fichaPerfilId vacío, queda deshabilitado y no llama al service', () => {
    // Act
    const { result } = renderHook(() => useItemsFichaRepresentante(''), { wrapper: crearWrapper() });

    // Assert
    expect(result.current.fetchStatus).toBe('idle');
    expect(getItemsFichaRepresentante).not.toHaveBeenCalled();
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getItemsFichaRepresentante.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useItemsFichaRepresentante('f-1'), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
