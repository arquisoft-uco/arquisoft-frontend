import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/axiosInstance';
import { repositorioArtefactosService } from './repositorioArtefactosService';

vi.mock('../../../api/axiosInstance', () => ({ default: { post: vi.fn(), delete: vi.fn() } }));

const post = vi.mocked(apiClient.post);
const borrar = vi.mocked(apiClient.delete);

describe('repositorioArtefactosService.solicitarCargaVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide la carga a POST /repositorio-artefactos/{id}/versiones/cargas y devuelve el cuerpo', async () => {
    // Arrange
    const req = { nombreArchivo: 'a.pdf', tipoContenido: 'application/pdf', tamanoBytes: 1 };
    const carga = { carga: 'c-1', url: 'http://minio.test', campos: {}, expiraEn: 'x' };
    post.mockResolvedValue({ data: carga });

    // Act
    const resultado = await repositorioArtefactosService.solicitarCargaVersion('r-1', req);

    // Assert
    expect(post).toHaveBeenCalledWith('/repositorio-artefactos/r-1/versiones/cargas', req);
    expect(resultado).toEqual(carga);
  });
});

describe('repositorioArtefactosService.eliminarVersion', () => {
  it('llama DELETE a la ruta del contexto artefactos y resuelve sin cuerpo', async () => {
    // Arrange
    borrar.mockResolvedValue({ status: 204, data: '' });

    // Act
    const resultado = await repositorioArtefactosService.eliminarVersion('v-1');

    // Assert
    expect(borrar).toHaveBeenCalledWith('/artefactos/versiones-repositorio/v-1');
    expect(resultado).toBeUndefined();
  });
});
