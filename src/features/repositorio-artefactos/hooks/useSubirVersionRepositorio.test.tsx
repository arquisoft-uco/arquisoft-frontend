import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { useSubirVersionRepositorio } from './useSubirVersionRepositorio';

vi.mock('../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: {
    solicitarCargaVersion: vi.fn(),
    cargarArchivoVersion: vi.fn(),
    subirVersion: vi.fn(),
  },
}));

const solicitar = vi.mocked(repositorioArtefactosService.solicitarCargaVersion);
const cargar = vi.mocked(repositorioArtefactosService.cargarArchivoVersion);
const subir = vi.mocked(repositorioArtefactosService.subirVersion);

const ARCHIVO = new File(['contenido'], 'Manual.PDF');
const DATOS = { archivo: ARCHIVO, nombreDocumento: 'Manual', nuevoDocumento: true };
const CARGA = { carga: 'c-1', url: 'http://minio.test/b', campos: { key: 'k' }, expiraEn: 'x' };
const VERSIONES = { queryKey: ['repositorio-artefactos', 'r-1', 'versiones'] };

function errorApi(errorCode: string) {
  return new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'm', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useSubirVersionRepositorio', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    solicitar.mockResolvedValue(CARGA);
    cargar.mockResolvedValue(undefined);
    subir.mockResolvedValue({ id: 'v-1', numeroVersion: 1 });
  });

  it('encadena los tres pasos con sus cuerpos e invalida las versiones del repositorio', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSubirVersionRepositorio('r-1'), { wrapper });

    // Act
    result.current.mutate(DATOS);

    // Assert
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith(VERSIONES));
    expect(solicitar).toHaveBeenCalledWith('r-1', {
      nombreArchivo: 'Manual.PDF',
      tipoContenido: 'application/pdf',
      tamanoBytes: ARCHIVO.size,
    });
    expect(cargar).toHaveBeenCalledWith(CARGA, ARCHIVO, expect.any(Function));
    expect(subir).toHaveBeenCalledWith('r-1', {
      carga: 'c-1',
      nombreDocumento: 'Manual',
      nuevoDocumento: true,
    });
  });

  it('expone la fase y el porcentaje mientras sube y los reinicia al terminar', async () => {
    // Arrange
    let avanzar: (porcentaje: number) => void = () => undefined;
    let terminar: () => void = () => undefined;
    cargar.mockImplementation(
      (_carga, _archivo, onProgreso) =>
        new Promise<void>((resolver) => {
          avanzar = onProgreso!;
          terminar = resolver;
        }),
    );
    const { result } = renderHook(() => useSubirVersionRepositorio('r-1'), { wrapper });

    // Act
    result.current.mutate(DATOS);
    await waitFor(() => expect(result.current.fase).toBe('subiendo'));
    avanzar(40);

    // Assert
    await waitFor(() => expect(result.current.porcentaje).toBe(40));
    terminar();
    await waitFor(() => expect(result.current.fase).toBeNull());
    expect(result.current.porcentaje).toBe(0);
  });

  it('si falla la solicitud o la subida a MinIO no llama a los pasos siguientes ni invalida', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    solicitar.mockRejectedValueOnce(new Error('sin red'));
    const { result } = renderHook(() => useSubirVersionRepositorio('r-1'), { wrapper });

    // Act
    result.current.mutate(DATOS);
    await waitFor(() => expect(solicitar).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    // Assert
    expect(cargar).not.toHaveBeenCalled();
    expect(subir).not.toHaveBeenCalled();

    // Arrange
    cargar.mockRejectedValueOnce(new Error('MinIO rechazó'));

    // Act
    result.current.mutate(DATOS);
    await waitFor(() => expect(cargar).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    // Assert
    expect(subir).not.toHaveBeenCalled();
    expect(invalidar).not.toHaveBeenCalled();
  });

  it('invalida las versiones cuando el documento ya existe o ya no existe', async () => {
    // Arrange
    subir.mockRejectedValue(errorApi('DOCUMENTO_YA_EXISTE'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSubirVersionRepositorio('r-1'), { wrapper });

    // Act
    result.current.mutate(DATOS);

    // Assert
    await waitFor(() => expect(invalidar).toHaveBeenCalledWith(VERSIONES));
    expect(result.current.faseDelError()).toBe('registrando');
  });
});
