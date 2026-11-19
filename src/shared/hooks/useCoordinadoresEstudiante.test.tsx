import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../test-utils/render';
import { coordinadoresEstudianteService } from '../services/coordinadoresEstudianteService';
import { useCoordinadoresEstudiante } from './useCoordinadoresEstudiante';

vi.mock('../services/coordinadoresEstudianteService', () => ({
  coordinadoresEstudianteService: { consultarCoordinadores: vi.fn() },
}));

const consultar = vi.mocked(coordinadoresEstudianteService.consultarCoordinadores);

const COORDINADORES = [
  {
    proyectoGradoId: 'pg-1',
    tituloProyecto: 'Sistema de riego',
    coordinadorId: 'co-1',
    identificador: '1',
    nombre: 'Ana',
    email: 'ana@uco.edu.co',
  },
];

function crearContexto() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useCoordinadoresEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el service y cachea la lista bajo su key', async () => {
    // Arrange
    consultar.mockResolvedValue(COORDINADORES);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useCoordinadoresEstudiante(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(COORDINADORES);
    expect(queryClient.getQueryData(['proyectos-grado', 'estudiante', 'coordinadores'])).toEqual(
      COORDINADORES,
    );
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('falló'));
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useCoordinadoresEstudiante(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
