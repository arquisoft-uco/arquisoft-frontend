import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import {
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import { mapasRutaService } from '../services/mapasRutaService';
import { useTarea } from './useTarea';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarTarea: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarTarea);

const TAREA = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

function crearError(status: number) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: '',
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useTarea', () => {
  afterEach(restaurarTemporizadores);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone la tarea consultada con el id recibido', async () => {
    // Arrange
    consultar.mockResolvedValue(TAREA);

    // Act
    const { result } = renderHook(() => useTarea('t-1'));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    // Assert
    expect(consultar).toHaveBeenCalledWith('t-1');
    expect(result.current.tarea).toEqual(TAREA);
    expect(result.current.noEncontrada).toBe(false);
    expect(result.current.hayError).toBe(false);
  });

  it('no consulta al service cuando no hay id de tarea', () => {
    // Arrange
    consultar.mockResolvedValue(TAREA);

    // Act
    renderHook(() => useTarea(''));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('trata 404 y 400 como no encontrada, sin error y sin reintentar', async () => {
    for (const status of [404, 400]) {
      // Arrange
      consultar.mockReset();
      consultar.mockRejectedValue(crearError(status));

      // Act
      const { result, unmount } = renderHook(() => useTarea(`t-${status}`));
      await waitFor(() => expect(result.current.noEncontrada).toBe(true));

      // Assert
      expect(result.current.hayError).toBe(false);
      expect(result.current.tarea).toBeUndefined();
      expect(consultar).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it('marca error con otro estado y reintentar vuelve a consultar', async () => {
    // Arrange
    usarTemporizadoresFalsos();
    consultar.mockRejectedValue(crearError(500));

    // Act
    const { result } = renderHook(() => useTarea('t-1'));
    await waitFor(() => expect(result.current.hayError).toBe(true), { timeout: 10000 });
    const llamadas = consultar.mock.calls.length;
    consultar.mockResolvedValue(TAREA);
    await result.current.reintentar();

    // Assert
    expect(result.current.noEncontrada).toBe(false);
    expect(consultar.mock.calls.length).toBeGreaterThan(llamadas);
    await waitFor(() => expect(result.current.tarea).toEqual(TAREA));
  });
});
