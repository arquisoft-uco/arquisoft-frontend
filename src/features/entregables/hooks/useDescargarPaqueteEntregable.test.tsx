import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { toast } from '../../../shared/hooks/useToast';
import { iniciarDescarga } from '../../../shared/utils/iniciar-descarga';
import { entregablesService } from '../services/entregablesService';
import { useDescargarPaqueteEntregable } from './useDescargarPaqueteEntregable';

vi.mock('../services/entregablesService', () => ({
  entregablesService: { obtenerEnlacePaquete: vi.fn() },
}));

vi.mock('../../../shared/utils/iniciar-descarga', () => ({ iniciarDescarga: vi.fn() }));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const obtenerEnlace = vi.mocked(entregablesService.obtenerEnlacePaquete);

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useDescargarPaqueteEntregable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('en éxito inicia la descarga y avisa con la versión del entregable', async () => {
    // Arrange
    obtenerEnlace.mockResolvedValue({ url: 'https://s3.test/p', expiraEn: '2026-11-11T10:00Z' });
    const { result } = renderHook(() => useDescargarPaqueteEntregable(), {
      wrapper: crearWrapper(),
    });

    // Act
    act(() => result.current.descargar({ id: 'e-1', versionEntregable: 3 }));

    // Assert
    await waitFor(() => expect(iniciarDescarga).toHaveBeenCalledWith('https://s3.test/p'));
    expect(obtenerEnlace).toHaveBeenCalledWith('e-1');
    expect(toast.success).toHaveBeenCalledWith('Descarga iniciada', 'Paquete de la versión 3');
  });

  it('en error muestra el mensaje mapeado por código y no inicia la descarga', async () => {
    // Arrange
    obtenerEnlace.mockRejectedValue(
      errorApi(422, { errorCode: 'ENTREGABLES_PAQUETE_ENTREGABLE_NO_DISPONIBLE' }),
    );
    const { result } = renderHook(() => useDescargarPaqueteEntregable(), {
      wrapper: crearWrapper(),
    });

    // Act
    act(() => result.current.descargar({ id: 'e-1', versionEntregable: 3 }));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo descargar el paquete',
        'El paquete de este entregable no está disponible.',
      ),
    );
    expect(iniciarDescarga).not.toHaveBeenCalled();
  });
});
