import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import {
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import { mapasRutaService } from '../services/mapasRutaService';
import { useMapaRutaEstudiante } from './useMapaRutaEstudiante';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarMapaRutaEstudiante: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarMapaRutaEstudiante);

function crearError(status: number) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: '',
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useMapaRutaEstudiante', () => {
  afterEach(restaurarTemporizadores);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone el mapa cuando la consulta tiene éxito', async () => {
    // Arrange
    const mapa = {
      id: 'm-1',
      proyectoGradoId: 'p-1',
      titulo: 'Sistema A',
      fechaInicio: '2026-03-05',
      fechaFin: '2026-08-01',
    };
    consultar.mockResolvedValue(mapa);

    // Act
    const { result } = renderHook(() => useMapaRutaEstudiante());
    await waitFor(() => expect(result.current.cargando).toBe(false));

    // Assert
    expect(result.current.mapa).toEqual(mapa);
    expect(result.current.sinMapa).toBe(false);
    expect(result.current.hayError).toBe(false);
  });

  it('trata un 404 como sin mapa, sin error y sin reintentar', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError(404));

    // Act
    const { result } = renderHook(() => useMapaRutaEstudiante());
    await waitFor(() => expect(result.current.sinMapa).toBe(true));

    // Assert
    expect(result.current.hayError).toBe(false);
    expect(result.current.mapa).toBeUndefined();
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it('marca error cuando falla con un estado distinto de 404', async () => {
    // Arrange
    usarTemporizadoresFalsos();
    consultar.mockRejectedValue(crearError(400));

    // Act
    const { result } = renderHook(() => useMapaRutaEstudiante());
    await waitFor(() => expect(result.current.hayError).toBe(true), { timeout: 10000 });

    // Assert
    expect(result.current.sinMapa).toBe(false);
  });
});
