import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { cargaPrefirmadaService } from '../../../shared/services/cargaPrefirmadaService';
import { artefactosService } from '../services/artefactosService';
import { useSubirVersionArtefacto } from './useSubirVersionArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    solicitarCargaVersionArtefacto: vi.fn(),
    generarVersionArtefacto: vi.fn(),
  },
}));

vi.mock('../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));

const solicitar = vi.mocked(artefactosService.solicitarCargaVersionArtefacto);
const registrar = vi.mocked(artefactosService.generarVersionArtefacto);
const cargar = vi.mocked(cargaPrefirmadaService.cargarArchivo);

const ARCHIVO = new File(['contenido'], 'notas.md', { type: '' });
const CARGA = { carga: 'c-1', url: 'http://minio.test/b', campos: { key: 'k' }, expiraEn: 'x' };

describe('useSubirVersionArtefacto', () => {
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
    registrar.mockResolvedValue({ id: 'v-1', version: 2 });
  });

  it('encadena solicitar, cargar y registrar con el tipo canónico e invalida los listados del estudiante', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSubirVersionArtefacto('a-1'), { wrapper });

    // Act
    result.current.mutate({ archivo: ARCHIVO });

    // Assert
    await waitFor(() =>
      expect(invalidar).toHaveBeenCalledWith({
        queryKey: ['artefactos', 'versiones-artefacto', 'estudiante'],
      }),
    );
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['artefactos', 'estudiante'] });
    expect(solicitar).toHaveBeenCalledWith('a-1', {
      nombreArchivo: 'notas.md',
      tipoContenido: 'text/markdown',
      tamanoBytes: ARCHIVO.size,
    });
    expect(cargar).toHaveBeenCalledWith(CARGA, ARCHIVO, expect.any(Function));
    expect(registrar).toHaveBeenCalledWith('a-1', { carga: 'c-1' });
    expect(solicitar.mock.invocationCallOrder[0]).toBeLessThan(cargar.mock.invocationCallOrder[0]);
    expect(cargar.mock.invocationCallOrder[0]).toBeLessThan(registrar.mock.invocationCallOrder[0]);
  });

  it('si falla el almacenamiento no registra, no invalida e informa la fase donde falló', async () => {
    // Arrange
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    cargar.mockRejectedValueOnce(new Error('almacenamiento rechazó'));
    const { result } = renderHook(() => useSubirVersionArtefacto('a-1'), { wrapper });

    // Act
    result.current.mutate({ archivo: ARCHIVO });
    await waitFor(() => expect(cargar).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    // Assert
    expect(registrar).not.toHaveBeenCalled();
    expect(invalidar).not.toHaveBeenCalled();
    expect(result.current.faseDelError()).toBe('subiendo');
  });
});
