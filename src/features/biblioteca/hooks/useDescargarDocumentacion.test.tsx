import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { toast } from '../../../shared/hooks/useToast';
import { iniciarDescarga } from '../../../shared/utils/iniciar-descarga';
import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';
import type { Documentacion } from '../models/Documentacion';
import { bibliotecaService } from '../services/bibliotecaService';
import { useDescargarDocumentacion } from './useDescargarDocumentacion';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: { obtenerEnlaceDescarga: vi.fn() },
}));

vi.mock('../../../shared/utils/iniciar-descarga', () => ({ iniciarDescarga: vi.fn() }));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const obtenerEnlace = vi.mocked(bibliotecaService.obtenerEnlaceDescarga);

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

describe('useDescargarDocumentacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('en éxito inicia la descarga con la url y avisa con el título', async () => {
    // Arrange
    obtenerEnlace.mockResolvedValue(ENLACE);
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useDescargarDocumentacion(), { wrapper });

    // Act
    act(() => result.current.descargar(DOCUMENTACION));

    // Assert
    await waitFor(() => expect(iniciarDescarga).toHaveBeenCalledWith('https://s3.test/d'));
    expect(obtenerEnlace).toHaveBeenCalledWith('d-1');
    expect(toast.success).toHaveBeenCalledWith('Descarga iniciada', 'Sistema de riego');
  });

  it('con título nulo avisa con la versión del entregable', async () => {
    // Arrange
    obtenerEnlace.mockResolvedValue(ENLACE);
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useDescargarDocumentacion(), { wrapper });

    // Act
    act(() => result.current.descargar({ ...DOCUMENTACION, tituloProyecto: null }));

    // Assert
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Descarga iniciada', 'Documentación, versión 3'),
    );
  });

  it('descargando es true mientras la mutación está pendiente', async () => {
    // Arrange
    let resolver: (enlace: EnlaceDescargaVersion) => void = () => undefined;
    obtenerEnlace.mockReturnValue(new Promise((resolve) => (resolver = resolve)));
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useDescargarDocumentacion(), { wrapper });

    // Act
    act(() => result.current.descargar(DOCUMENTACION));

    // Assert
    await waitFor(() => expect(result.current.descargando).toBe(true));

    // Act
    await act(async () => resolver(ENLACE));

    // Assert
    await waitFor(() => expect(result.current.descargando).toBe(false));
  });

  it.each([
    {
      caso: '422 NO_DESCARGABLE',
      error: errorApi(422, { errorCode: 'DOCUMENTACION_NO_DESCARGABLE' }),
      mensaje: 'La documentación ya no está disponible para descargar',
    },
    {
      caso: '422 ARCHIVO_NO_DISPONIBLE',
      error: errorApi(422, { errorCode: 'DOCUMENTACION_ARCHIVO_NO_DISPONIBLE' }),
      mensaje: 'El archivo de esta documentación aún no está disponible',
    },
    {
      caso: '503 ARCHIVO_AUSENTE',
      error: errorApi(503, { errorCode: 'DOCUMENTACION_ARCHIVO_AUSENTE' }),
      mensaje: 'No encontramos el archivo en el almacenamiento. Avisa a la biblioteca',
    },
    {
      caso: '503 de almacenamiento',
      error: errorApi(503, { errorCode: 'MINIO_CONSULTA_FALLIDA' }),
      mensaje: 'El servicio de archivos no responde. Inténtalo de nuevo en unos minutos',
    },
    {
      caso: '400 con mensaje del backend',
      error: errorApi(400, { errorCode: 'OTRO', message: 'Identificador inválido' }),
      mensaje: 'Identificador inválido',
    },
    {
      caso: '500 sin mensaje',
      error: errorApi(500),
      mensaje: 'Inténtalo nuevamente.',
    },
  ])('ante $caso avisa con su mensaje y no inicia la descarga', async ({ error, mensaje }) => {
    // Arrange
    obtenerEnlace.mockRejectedValue(error);
    const { wrapper } = crearWrapper();
    const { result } = renderHook(() => useDescargarDocumentacion(), { wrapper });

    // Act
    act(() => result.current.descargar(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('No se pudo descargar la documentación', mensaje),
    );
    expect(iniciarDescarga).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('invalida el listado solo ante DOCUMENTACION_NO_DESCARGABLE', async () => {
    // Arrange
    const { queryClient, wrapper } = crearWrapper();
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDescargarDocumentacion(), { wrapper });
    obtenerEnlace.mockRejectedValueOnce(
      errorApi(422, { errorCode: 'DOCUMENTACION_ARCHIVO_NO_DISPONIBLE' }),
    );

    // Act
    act(() => result.current.descargar(DOCUMENTACION));
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));

    // Assert
    expect(invalidar).not.toHaveBeenCalled();

    // Arrange
    obtenerEnlace.mockRejectedValueOnce(
      errorApi(422, { errorCode: 'DOCUMENTACION_NO_DESCARGABLE' }),
    );

    // Act
    act(() => result.current.descargar(DOCUMENTACION));

    // Assert
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({ queryKey: ['biblioteca', 'documentaciones'] }),
    );
  });
});
