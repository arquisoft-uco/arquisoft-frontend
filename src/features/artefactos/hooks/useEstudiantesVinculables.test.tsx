import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useEstudiantesVinculables } from './useEstudiantesVinculables';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    getEstudiantesProyectoAsesorado: vi.fn(),
    getEstudiantesArtefacto: vi.fn(),
  },
}));

const catalogo = vi.mocked(artefactosService.getEstudiantesProyectoAsesorado);
const vinculados = vi.mocked(artefactosService.getEstudiantesArtefacto);

const LUIS = { estudianteId: 'e-1', identificador: '2001', nombre: 'Luis', email: 'l@uco.edu.co' };
const ANA = { estudianteId: 'e-2', identificador: '2002', nombre: 'Ana', email: 'a@uco.edu.co' };

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useEstudiantesVinculables', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('ofrece los estudiantes del proyecto menos los ya vinculados al artefacto', async () => {
    // Arrange
    catalogo.mockResolvedValue([LUIS, ANA]);
    vinculados.mockResolvedValue([{ id: 'ea-1', artefactoId: 'a-1', vigente: true, ...LUIS }]);

    // Act
    const { result } = renderHook(() => useEstudiantesVinculables('p-1', 'a-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.estudiantes).toEqual([ANA]));
    expect(catalogo).toHaveBeenCalledWith('p-1');
    expect(vinculados).toHaveBeenCalledWith('a-1');
  });

  it('cuenta como error que falle cualquiera de las dos consultas', async () => {
    // Arrange
    catalogo.mockResolvedValue([LUIS]);
    vinculados.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useEstudiantesVinculables('p-1', 'a-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
