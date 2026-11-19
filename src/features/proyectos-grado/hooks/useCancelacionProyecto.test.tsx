import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { toast } from '../../../shared/hooks/useToast';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useCancelacionProyecto } from './useCancelacionProyecto';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    cancelarProyecto: vi.fn(),
  },
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cancelar = vi.mocked(proyectosGradoService.cancelarProyecto);
const FRASE = 'Cancelar proyecto de grado';

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function montar() {
  const onCancelado = vi.fn();
  const hook = renderHook(
    () => {
      const cancelacion = useCancelacionProyecto({ proyectoGradoId: 'p-1', onCancelado });
      void cancelacion.formulario.formState.errors;
      return cancelacion;
    },
    { wrapper: crearWrapper() },
  );
  return { ...hook, onCancelado };
}

async function llegarAConfirmacion(result: ReturnType<typeof montar>['result']) {
  act(() => result.current.solicitar());
  act(() => result.current.formulario.setValue('motivo', 'Sin avances'));
  await act(() => result.current.continuar());
}

describe('useCancelacionProyecto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('solicitar abre el paso del motivo y continuar no avanza con el motivo vacío', async () => {
    // Arrange
    const { result } = montar();

    // Act
    act(() => result.current.solicitar());
    await act(() => result.current.continuar());

    // Assert
    expect(result.current.paso).toBe('motivo');
    expect(result.current.formulario.formState.errors.motivo).toBeDefined();
  });

  it('con motivo válido continuar pasa a confirmación y volver conserva el motivo', async () => {
    // Arrange
    const { result } = montar();

    // Act
    await llegarAConfirmacion(result);

    // Assert
    expect(result.current.paso).toBe('confirmacion');

    // Act
    act(() => result.current.cambiarFrase('algo'));
    act(() => result.current.volver());

    // Assert
    expect(result.current.paso).toBe('motivo');
    expect(result.current.frase).toBe('');
    expect(result.current.formulario.getValues('motivo')).toBe('Sin avances');
  });

  it('fraseCoincide es verdadero solo con la frase y confirmar sin ella no envía', async () => {
    // Arrange
    const { result } = montar();
    await llegarAConfirmacion(result);

    // Act
    await act(() => result.current.confirmar());

    // Assert
    expect(result.current.fraseCoincide).toBe(false);
    expect(cancelar).not.toHaveBeenCalled();

    // Act
    act(() => result.current.cambiarFrase(FRASE));

    // Assert
    expect(result.current.fraseCoincide).toBe(true);
  });

  it('al confirmar envía solo el motivo, avisa el éxito, cierra y llama onCancelado', async () => {
    // Arrange
    cancelar.mockResolvedValue(undefined);
    const { result, onCancelado } = montar();
    await llegarAConfirmacion(result);
    act(() => result.current.cambiarFrase(FRASE));

    // Act
    await act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(onCancelado).toHaveBeenCalledTimes(1));
    expect(cancelar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1', motivo: 'Sin avances' });
    expect(toast.success).toHaveBeenCalledWith('Proyecto cancelado', expect.any(String));
    expect(result.current.paso).toBeNull();
  });

  it('ante un 422 muestra el message del backend y se queda en la confirmación', async () => {
    // Arrange
    cancelar.mockRejectedValue(
      errorApi(422, {
        message: 'El proyecto ya está cancelado',
        errorCode: 'PROYECTO_GRADO_NO_CANCELABLE',
      }),
    );
    const { result, onCancelado } = montar();
    await llegarAConfirmacion(result);
    act(() => result.current.cambiarFrase(FRASE));

    // Act
    await act(() => result.current.confirmar());

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo cancelar el proyecto',
        'El proyecto ya está cancelado',
      ),
    );
    expect(result.current.paso).toBe('confirmacion');
    expect(onCancelado).not.toHaveBeenCalled();
  });

  it('ante un 400 con error del campo motivo lo pinta, avisa con toast y vuelve al paso del motivo', async () => {
    // Arrange
    cancelar.mockRejectedValue(
      errorApi(400, {
        message: 'Datos inválidos',
        fieldErrors: [{ field: 'motivo', message: 'El motivo es muy largo' }],
      }),
    );
    const { result } = montar();
    await llegarAConfirmacion(result);
    act(() => result.current.cambiarFrase(FRASE));

    // Act
    await act(() => result.current.confirmar());

    // Assert
    await waitFor(() => expect(result.current.paso).toBe('motivo'));
    expect(result.current.formulario.formState.errors.motivo?.message).toBe(
      'El motivo es muy largo',
    );
    expect(toast.error).toHaveBeenCalled();
  });
});
