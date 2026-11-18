import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { toast } from '../../../shared/hooks/useToast';
import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';
import type { Documentacion } from '../models/Documentacion';
import { bibliotecaService } from '../services/bibliotecaService';
import { copiarAlPortapapeles } from '../utils/copiar-al-portapapeles';
import { useCompartirDocumentacion } from './useCompartirDocumentacion';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: { obtenerEnlaceCompartir: vi.fn() },
}));

vi.mock('../utils/copiar-al-portapapeles', () => ({ copiarAlPortapapeles: vi.fn() }));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const obtenerEnlace = vi.mocked(bibliotecaService.obtenerEnlaceCompartir);
const copiar = vi.mocked(copiarAlPortapapeles);

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

  it('en éxito con copia avisa con el vencimiento y no abre el respaldo', async () => {
    // Arrange
    obtenerEnlace.mockResolvedValue(ENLACE);
    copiar.mockResolvedValue(true);
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });

    // Act
    act(() => result.current.compartir(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Enlace copiado',
        expect.stringContaining('El enlace vence el'),
      ),
    );
    expect(obtenerEnlace).toHaveBeenCalledWith('d-1');
    expect(copiar).toHaveBeenCalledWith('https://s3.test/d');
    expect(result.current.enlaceManual).toBeNull();
  });

  it('si la copia falla guarda el respaldo con el enlace, avisa y cerrarlo lo limpia', async () => {
    // Arrange
    obtenerEnlace.mockResolvedValue(ENLACE);
    copiar.mockResolvedValue(false);
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useCompartirDocumentacion(), { wrapper });

    // Act
    act(() => result.current.compartir(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(result.current.enlaceManual).toEqual({ documentacion: DOCUMENTACION, enlace: ENLACE }),
    );
    expect(toast.info).toHaveBeenCalledWith(
      'No se pudo copiar automáticamente',
      'Copia el enlace desde la ventana',
    );
    expect(toast.success).not.toHaveBeenCalled();

    // Act
    act(() => result.current.cerrarEnlaceManual());

    // Assert
    expect(result.current.enlaceManual).toBeNull();
  });

  it('compartiendo es true mientras está pendiente y un segundo clic no pide otro enlace', async () => {
    // Arrange
    let resolver: (enlace: EnlaceDescargaVersion) => void = () => undefined;
    obtenerEnlace.mockReturnValue(new Promise((resolve) => (resolver = resolve)));
    copiar.mockResolvedValue(true);
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
    expect(copiar).not.toHaveBeenCalled();
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
    expect(result.current.enlaceManual).toBeNull();
  });
});
