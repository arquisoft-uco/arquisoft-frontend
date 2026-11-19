import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import {
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import { mapasRutaService } from '../services/mapasRutaService';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';
import { useMapaRutaEstudiante } from './useMapaRutaEstudiante';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarMapaRutaEstudiante: vi.fn() },
}));

vi.mock('../../../shared/hooks/useMisProyectosGrado', () => ({ useMisProyectosGrado: vi.fn() }));

const consultar = vi.mocked(mapasRutaService.consultarMapaRutaEstudiante);
const misProyectos = vi.mocked(useMisProyectosGrado);

function simularProyectos(sobrescribir: Partial<ReturnType<typeof useMisProyectosGrado>> = {}) {
  misProyectos.mockReturnValue({
    proyecto: {
      id: 'p-1',
      fichaPerfil: 'f-1',
      tituloProyecto: 'Sistema A',
      estado: { id: 'e-1', nombre: 'Activo' },
    },
    proyectos: [],
    seleccionarProyecto: vi.fn(),
    cargado: true,
    sinProyecto: false,
    hayError: false,
    reintentar: vi.fn(),
    ...sobrescribir,
  } as ReturnType<typeof useMisProyectosGrado>);
}

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
    simularProyectos();
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
    expect(consultar).toHaveBeenCalledWith('p-1');
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

  it('no consulta el mapa y marca sin mapa cuando el estudiante no tiene proyecto de grado', async () => {
    // Arrange
    simularProyectos({ proyecto: undefined, sinProyecto: true });

    // Act
    const { result } = renderHook(() => useMapaRutaEstudiante());

    // Assert
    expect(result.current.sinMapa).toBe(true);
    expect(result.current.cargando).toBe(false);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('marca error sin consultar el mapa cuando falla la consulta de proyectos', async () => {
    // Arrange
    simularProyectos({ proyecto: undefined, cargado: false, hayError: true });

    // Act
    const { result } = renderHook(() => useMapaRutaEstudiante());

    // Assert
    expect(result.current.hayError).toBe(true);
    expect(result.current.cargando).toBe(false);
    expect(consultar).not.toHaveBeenCalled();
  });
});
