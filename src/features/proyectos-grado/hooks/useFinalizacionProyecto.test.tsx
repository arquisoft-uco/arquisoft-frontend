import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { toast } from '../../../shared/hooks/useToast';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useFinalizacionProyecto } from './useFinalizacionProyecto';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    finalizarProyecto: vi.fn(),
  },
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const finalizar = vi.mocked(proyectosGradoService.finalizarProyecto);
const FRASE = 'Finalizar proyecto de grado';

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function montar() {
  const onFinalizado = vi.fn();
  const hook = renderHook(() => useFinalizacionProyecto({ proyectoGradoId: 'p-1', onFinalizado }), {
    wrapper: crearWrapper(),
  });
  return { ...hook, onFinalizado };
}

describe('useFinalizacionProyecto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fraseCoincide es verdadero solo con la frase y confirmar sin ella no envía', () => {
    // Arrange
    const { result } = montar();
    act(() => result.current.solicitar());

    // Act
    act(() => result.current.confirmar());

    // Assert
    expect(result.current.abierto).toBe(true);
    expect(result.current.fraseCoincide).toBe(false);
    expect(finalizar).not.toHaveBeenCalled();

    // Act
    act(() => result.current.cambiarFrase(FRASE));

    // Assert
    expect(result.current.fraseCoincide).toBe(true);
  });

  it('al confirmar envía el id, avisa el éxito, cierra y llama onFinalizado', async () => {
    // Arrange
    finalizar.mockResolvedValue(undefined);
    const { result, onFinalizado } = montar();
    act(() => result.current.solicitar());
    act(() => result.current.cambiarFrase(FRASE));

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(onFinalizado).toHaveBeenCalledTimes(1));
    expect(finalizar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1' });
    expect(toast.success).toHaveBeenCalledWith('Proyecto finalizado', expect.any(String));
    expect(result.current.abierto).toBe(false);
    expect(result.current.frase).toBe('');
  });

  it('ante un 422 muestra el message del backend y deja el diálogo abierto con la frase', async () => {
    // Arrange
    finalizar.mockRejectedValue(
      errorApi(422, {
        message: 'El último entregable no está cerrado',
        errorCode: 'PROYECTO_GRADO_ULTIMO_ENTREGABLE_NO_DEFINITIVO',
      }),
    );
    const { result, onFinalizado } = montar();
    act(() => result.current.solicitar());
    act(() => result.current.cambiarFrase(FRASE));

    // Act
    act(() => result.current.confirmar());

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo finalizar el proyecto',
        'El último entregable no está cerrado',
      ),
    );
    expect(result.current.abierto).toBe(true);
    expect(result.current.frase).toBe(FRASE);
    expect(onFinalizado).not.toHaveBeenCalled();
  });
});
