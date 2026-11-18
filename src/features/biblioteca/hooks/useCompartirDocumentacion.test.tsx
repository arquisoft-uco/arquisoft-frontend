import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { toast } from '../../../shared/hooks/useToast';
import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';
import type { Documentacion } from '../models/Documentacion';
import { bibliotecaService } from '../services/bibliotecaService';
import { useCompartirDocumentacion } from './useCompartirDocumentacion';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: { obtenerEnlaceCompartir: vi.fn() },
}));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const obtenerEnlace = vi.mocked(bibliotecaService.obtenerEnlaceCompartir);

const ENLACE: EnlaceDescargaVersion = { url: 'https://s3.test/d', expiraEn: '2026-11-17T10:00Z' };

const DOCUMENTACION: Documentacion = {
  id: 'd-1',
  tituloProyecto: 'Sistema de riego',
  autores: [],
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 3 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useCompartirDocumentacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('en éxito expone el enlace compartido sin copiar ni avisar', async () => {
    // Arrange
    obtenerEnlace.mockResolvedValue(ENLACE);
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });

    // Act
    act(() => result.current.compartir(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(result.current.enlaceCompartido).toEqual({
        documentacion: DOCUMENTACION,
        enlace: ENLACE,
      }),
    );
    expect(obtenerEnlace).toHaveBeenCalledWith('d-1');
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('cerrarEnlaceCompartido lo limpia y compartir de nuevo descarta el anterior antes de pedir otro', async () => {
    // Arrange
    let resolver: (enlace: EnlaceDescargaVersion) => void = () => undefined;
    obtenerEnlace.mockResolvedValue(ENLACE);
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });
    act(() => result.current.compartir(DOCUMENTACION));
    await waitFor(() => expect(result.current.enlaceCompartido).not.toBeNull());

    // Act
    act(() => result.current.cerrarEnlaceCompartido());

    // Assert
    expect(result.current.enlaceCompartido).toBeNull();

    // Arrange
    act(() => result.current.compartir(DOCUMENTACION));
    await waitFor(() => expect(result.current.enlaceCompartido).not.toBeNull());
    obtenerEnlace.mockReturnValueOnce(new Promise((resolve) => (resolver = resolve)));

    // Act
    act(() => result.current.compartir({ ...DOCUMENTACION, id: 'd-2' }));

    // Assert
    await waitFor(() => expect(result.current.compartiendo).toBe(true));
    expect(result.current.enlaceCompartido).toBeNull();
    expect(obtenerEnlace).toHaveBeenLastCalledWith('d-2');

    // Act
    await act(async () => resolver(ENLACE));
  });

  it('compartiendo es true mientras está pendiente y un segundo clic no pide otro enlace', async () => {
    // Arrange
    let resolver: (enlace: EnlaceDescargaVersion) => void = () => undefined;
    obtenerEnlace.mockReturnValue(new Promise((resolve) => (resolver = resolve)));
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });

    // Act
    act(() => result.current.compartir(DOCUMENTACION));
    await waitFor(() => expect(result.current.compartiendo).toBe(true));
    act(() => result.current.compartir(DOCUMENTACION));

    // Assert
    expect(obtenerEnlace).toHaveBeenCalledTimes(1);

    // Act
    await act(async () => resolver(ENLACE));

    // Assert
    await waitFor(() => expect(result.current.compartiendo).toBe(false));
  });

  it('ante 422 NO_COMPARTIBLE muestra el mensaje del backend e invalida el listado', async () => {
    // Arrange
    obtenerEnlace.mockRejectedValue(
      errorApi(422, {
        errorCode: 'DOCUMENTACION_NO_COMPARTIBLE',
        message: 'La documentación no está disponible para compartir',
      }),
    );
    const { queryClient, wrapper } = crearWrapper();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });

    // Act
    act(() => result.current.compartir(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo compartir la documentación',
        'La documentación no está disponible para compartir',
      ),
    );
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['biblioteca', 'documentaciones'] });
  });

  it('ante 422 ARCHIVO_NO_DISPONIBLE muestra el mensaje del backend sin invalidar', async () => {
    // Arrange
    obtenerEnlace.mockRejectedValue(
      errorApi(422, {
        errorCode: 'DOCUMENTACION_ARCHIVO_NO_DISPONIBLE',
        message: 'El archivo de la documentación aún no está disponible',
      }),
    );
    const { queryClient, wrapper } = crearWrapper();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });

    // Act
    act(() => result.current.compartir(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo compartir la documentación',
        'El archivo de la documentación aún no está disponible',
      ),
    );
    expect(invalidar).not.toHaveBeenCalled();
  });

  it('ante 503 avisa con el mensaje genérico de almacenamiento', async () => {
    // Arrange
    obtenerEnlace.mockRejectedValue(errorApi(503, { errorCode: 'MINIO_CONSULTA_FALLIDA' }));
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });

    // Act
    act(() => result.current.compartir(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo compartir la documentación',
        'El servicio de archivos no responde. Inténtalo de nuevo en unos minutos',
      ),
    );
    expect(result.current.enlaceCompartido).toBeNull();
  });
});
