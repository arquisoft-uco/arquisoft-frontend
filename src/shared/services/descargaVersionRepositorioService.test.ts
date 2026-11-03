import { describe, it, expect, vi } from 'vitest';
import apiClient from '../../api/axiosInstance';
import { descargaVersionRepositorioService } from './descargaVersionRepositorioService';

vi.mock('../../api/axiosInstance', () => ({ default: { get: vi.fn() } }));

describe('descargaVersionRepositorioService.obtenerEnlace', () => {
  it('pide el enlace de la versión por GET y devuelve el cuerpo', async () => {
    // Arrange
    const enlace = { url: 'https://s3.test/archivo?firma=x', expiraEn: '2026-11-02T10:05:00Z' };
    vi.mocked(apiClient.get).mockResolvedValue({ data: enlace });

    // Act
    const resultado = await descargaVersionRepositorioService.obtenerEnlace('v-1');

    // Assert
    expect(apiClient.get).toHaveBeenCalledWith('/repositorio-artefactos/versiones/v-1/descarga');
    expect(resultado).toEqual(enlace);
  });
});

describe('descargaVersionRepositorioService.obtenerEnlaceVersionArtefacto', () => {
  it('pide el enlace de la versión del artefacto por GET y devuelve el cuerpo', async () => {
    // Arrange
    const enlace = { url: 'https://s3.test/archivo?firma=x', expiraEn: '2026-11-02T10:05:00Z' };
    vi.mocked(apiClient.get).mockResolvedValue({ data: enlace });

    // Act
    const resultado = await descargaVersionRepositorioService.obtenerEnlaceVersionArtefacto('v-9');

    // Assert
    expect(apiClient.get).toHaveBeenCalledWith('/artefactos/versiones/v-9/descarga');
    expect(resultado).toEqual(enlace);
  });
});
