import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../test-utils/render';
import { errorApi } from '../../test-utils/errores-api';
import { descargaVersionRepositorioService } from '../services/descargaVersionRepositorioService';
import { iniciarDescarga } from '../utils/iniciar-descarga';
import { toast } from './useToast';
import { useDescargarVersionRepositorio } from './useDescargarVersionRepositorio';

vi.mock('../services/descargaVersionRepositorioService', () => ({
  descargaVersionRepositorioService: {
    obtenerEnlace: vi.fn(),
    obtenerEnlaceVersionArtefacto: vi.fn(),
  },
}));

vi.mock('../utils/iniciar-descarga', () => ({ iniciarDescarga: vi.fn() }));

vi.mock('./useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const obtenerEnlace = vi.mocked(descargaVersionRepositorioService.obtenerEnlace);
const obtenerEnlaceArtefacto = vi.mocked(
  descargaVersionRepositorioService.obtenerEnlaceVersionArtefacto,
);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useDescargarVersionRepositorio', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('en éxito pide el enlace de la versión, inicia la descarga y avisa con el nombre del documento', async () => {
    // Arrange
    obtenerEnlace.mockResolvedValue({
      url: 'https://s3.test/a?f=1',
      expiraEn: '2026-11-02T10:05Z',
    });
    const { result } = renderHook(() => useDescargarVersionRepositorio(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.descargar('v-1', 'Acta de inicio'));

    // Assert
    await waitFor(() => expect(iniciarDescarga).toHaveBeenCalledWith('https://s3.test/a?f=1'));
    expect(obtenerEnlace).toHaveBeenCalledWith('v-1');
    expect(toast.success).toHaveBeenCalledWith('Descarga iniciada', 'Acta de inicio');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('en error muestra el mensaje del backend y no inicia la descarga', async () => {
    // Arrange
    obtenerEnlace.mockRejectedValue(errorApi(422, { message: 'La versión solicitada no existe' }));
    const { result } = renderHook(() => useDescargarVersionRepositorio(), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.descargar('v-1', 'Acta de inicio'));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo descargar el archivo',
        'La versión solicitada no existe',
      ),
    );
    expect(iniciarDescarga).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('descargando es true mientras llega el enlace y vuelve a false al terminar', async () => {
    // Arrange
    let resolver: (v: { url: string; expiraEn: string }) => void = () => undefined;
    obtenerEnlace.mockReturnValue(new Promise((r) => (resolver = r)));
    const { result } = renderHook(() => useDescargarVersionRepositorio(), {
      wrapper: crearWrapper(queryClient),
    });
    expect(result.current.descargando).toBe(false);

    // Act
    act(() => result.current.descargar('v-1', 'Acta de inicio'));

    // Assert
    await waitFor(() => expect(result.current.descargando).toBe(true));
    await act(async () => resolver({ url: 'https://s3.test/a', expiraEn: '2026-11-02T10:05Z' }));
    await waitFor(() => expect(result.current.descargando).toBe(false));
  });

  it('con origen artefacto usa el enlace de la versión del artefacto y no el del repositorio', async () => {
    // Arrange
    obtenerEnlaceArtefacto.mockResolvedValue({
      url: 'https://s3.test/art?f=1',
      expiraEn: '2026-11-02T10:05Z',
    });
    const { result } = renderHook(() => useDescargarVersionRepositorio('artefacto'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.descargar('v-7', 'Acta de inicio'));

    // Assert
    await waitFor(() => expect(iniciarDescarga).toHaveBeenCalledWith('https://s3.test/art?f=1'));
    expect(obtenerEnlaceArtefacto).toHaveBeenCalledWith('v-7');
    expect(obtenerEnlace).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Descarga iniciada', 'Acta de inicio');
  });

  it('con origen artefacto muestra el mensaje del backend ante un error', async () => {
    // Arrange
    obtenerEnlaceArtefacto.mockRejectedValue(
      errorApi(503, { message: 'El archivo no está disponible' }),
    );
    const { result } = renderHook(() => useDescargarVersionRepositorio('artefacto'), {
      wrapper: crearWrapper(queryClient),
    });

    // Act
    act(() => result.current.descargar('v-7', 'Acta de inicio'));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo descargar el archivo',
        'El archivo no está disponible',
      ),
    );
    expect(iniciarDescarga).not.toHaveBeenCalled();
  });
});
