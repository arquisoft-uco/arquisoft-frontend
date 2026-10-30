import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/axiosInstance';
import { cargaPrefirmadaService } from './cargaPrefirmadaService';

vi.mock('../../api/axiosInstance', () => ({ default: { post: vi.fn() } }));

const post = vi.mocked(apiClient.post);

const DESTINO = {
  url: 'http://minio.test/bucket',
  campos: { key: 'abc', policy: 'p', 'Content-Type': 'application/pdf' },
};

describe('cargaPrefirmadaService.cargarArchivo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    post.mockResolvedValue({ data: undefined });
  });

  it('envía los campos firmados en orden y el archivo al final, sin credenciales', async () => {
    // Arrange
    const archivo = new File(['x'], 'manual.pdf');

    // Act
    await cargaPrefirmadaService.cargarArchivo(DESTINO, archivo);

    // Assert
    const [url, cuerpo, opciones] = post.mock.calls[0];
    const formData = cuerpo as FormData;
    expect(url).toBe(DESTINO.url);
    expect([...formData.keys()]).toEqual(['key', 'policy', 'Content-Type', 'file']);
    expect(formData.get('policy')).toBe('p');
    expect((formData.get('file') as File).name).toBe('manual.pdf');
    expect(opciones).toMatchObject({
      _sinCredenciales: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('reporta el porcentaje redondeado solo cuando el total es conocido', async () => {
    // Arrange
    const onProgreso = vi.fn();
    await cargaPrefirmadaService.cargarArchivo(DESTINO, new File(['x'], 'a.pdf'), onProgreso);
    const alProgresar = post.mock.calls[0][2]!.onUploadProgress!;

    // Act
    alProgresar({ loaded: 1, total: 3, bytes: 1, lengthComputable: true });
    alProgresar({ loaded: 5, bytes: 5, lengthComputable: false });

    // Assert
    expect(onProgreso).toHaveBeenCalledTimes(1);
    expect(onProgreso).toHaveBeenCalledWith(33);
  });
});
