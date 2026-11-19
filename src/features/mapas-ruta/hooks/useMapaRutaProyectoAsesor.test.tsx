import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import {
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import { mapasRutaService } from '../services/mapasRutaService';
import { useMapaRutaProyectoAsesor } from './useMapaRutaProyectoAsesor';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarMapaRutaProyectoAsesor: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarMapaRutaProyectoAsesor);

function crearError(status: number) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: '',
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useMapaRutaProyectoAsesor', () => {
  afterEach(restaurarTemporizadores);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone el mapa y consulta con el id del proyecto', async () => {
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
    const { result } = renderHook(() => useMapaRutaProyectoAsesor('p-1'));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(result.current.mapa).toEqual(mapa);
    expect(result.current.sinMapa).toBe(false);
    expect(result.current.hayError).toBe(false);
  });

  it('trata un 404 como sin mapa, sin error y sin reintentar', async () => {
    // Arrange
    consultar.mockRejectedValue(crearError(404));

    // Act
    const { result } = renderHook(() => useMapaRutaProyectoAsesor('p-1'));
    await waitFor(() => expect(result.current.sinMapa).toBe(true));

    // Assert
    expect(result.current.hayError).toBe(false);
    expect(result.current.mapa).toBeUndefined();
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it('marca error cuando falla con un estado distinto de 404', async () => {
    // Arrange
    usarTemporizadoresFalsos();
    consultar.mockRejectedValue(crearError(500));

    // Act
    const { result } = renderHook(() => useMapaRutaProyectoAsesor('p-1'));
    await waitFor(() => expect(result.current.hayError).toBe(true), { timeout: 10000 });

    // Assert
    expect(result.current.sinMapa).toBe(false);
  });
});
