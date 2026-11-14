import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { useAsesoresProyecto } from './useAsesoresProyecto';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarAsesoresProyecto: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarAsesoresProyecto);

const ASESORES = [
  { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co', estadoId: 'ASIGNADO', actual: true },
];

describe('useAsesoresProyecto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no consulta sin proyectoGradoId', () => {
    // Act
    const { result } = renderHook(() => useAsesoresProyecto(undefined));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('con proyectoGradoId consulta el service y expone los asesores', async () => {
    // Arrange
    consultar.mockResolvedValue(ASESORES);

    // Act
    const { result } = renderHook(() => useAsesoresProyecto('p-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(result.current.data).toEqual(ASESORES);
  });
});
