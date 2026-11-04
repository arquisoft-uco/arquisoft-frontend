import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useEstadosTarea } from './useEstadosTarea';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarEstadosTarea: vi.fn() },
}));

describe('useEstadosTarea', () => {
  it('devuelve el catálogo de estados del service', async () => {
    // Arrange
    const catalogo = [{ id: 'NUEVA', nombre: 'Nueva', descripcion: 'Sin iniciar' }];
    vi.mocked(mapasRutaService.consultarEstadosTarea).mockResolvedValue(catalogo);

    // Act
    const { result } = renderHook(() => useEstadosTarea());

    // Assert
    await waitFor(() => expect(result.current.data).toEqual(catalogo));
  });

  it('expone isError cuando el service rechaza', async () => {
    // Arrange
    vi.mocked(mapasRutaService.consultarEstadosTarea).mockRejectedValue(new Error('red'));

    // Act
    const { result } = renderHook(() => useEstadosTarea());

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('devuelve una lista vacía cuando el catálogo no tiene filas', async () => {
    // Arrange
    vi.mocked(mapasRutaService.consultarEstadosTarea).mockResolvedValue([]);

    // Act
    const { result } = renderHook(() => useEstadosTarea());

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
