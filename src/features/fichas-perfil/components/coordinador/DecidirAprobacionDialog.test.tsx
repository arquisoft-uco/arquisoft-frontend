import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useAgregarEstadoAprobacionFichaPerfil } from '../../hooks/useAgregarEstadoAprobacionFichaPerfil';
import DecidirAprobacionDialog from './DecidirAprobacionDialog';
import type { FichaPerfil } from '../../models/FichaPerfil';

vi.mock('../../hooks/useAgregarEstadoAprobacionFichaPerfil', () => ({
  useAgregarEstadoAprobacionFichaPerfil: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const FICHA: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estado: {
    id: 'DISPONIBLE_PARA_EVALUACION',
    nombre: 'Disponible para evaluación',
    fechaActualizacion: '2026-10-01T15:30:00',
  },
};

type Resultado = ReturnType<typeof useAgregarEstadoAprobacionFichaPerfil>;
type Opciones = { onSuccess?: () => void; onError?: (e: unknown) => void };

function simular(modo: 'exito' | 'error' | 'ninguno', parcial: Partial<Resultado> = {}) {
  const mutate = vi.fn((_acepta: boolean, opciones?: Opciones) => {
    if (modo === 'exito') opciones?.onSuccess?.();
    if (modo === 'error') {
      opciones?.onError?.({
        isAxiosError: true,
        response: { status: 422, data: { message: 'La ficha no tiene evaluación finalizada' } },
      });
    }
  });
  vi.mocked(useAgregarEstadoAprobacionFichaPerfil).mockReturnValue({
    mutate,
    isPending: false,
    ...parcial,
  } as Resultado);
  return mutate;
}

describe('DecidirAprobacionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('al confirmar "Aprobar ficha" envía acepta=true, avisa el éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular('exito');
    const onCerrar = vi.fn();
    render(<DecidirAprobacionDialog ficha={FICHA} acepta onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Aprobar ficha' }));

    // Assert
    expect(useAgregarEstadoAprobacionFichaPerfil).toHaveBeenCalledWith('f-1');
    expect(mutate).toHaveBeenCalledWith(true, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Ficha aprobada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al confirmar "No aprobar ficha" envía acepta=false y avisa que no se aprobó', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular('exito');
    render(<DecidirAprobacionDialog ficha={FICHA} acepta={false} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'No aprobar ficha' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(false, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Ficha no aprobada', expect.any(String));
  });

  it('un 422 muestra el mensaje del backend en un toast de error, cierra y no avisa éxito', async () => {
    // Arrange
    const user = userEvent.setup();
    simular('error');
    const onCerrar = vi.fn();
    render(<DecidirAprobacionDialog ficha={FICHA} acepta onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Aprobar ficha' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo aprobar la ficha',
      'La ficha no tiene evaluación finalizada',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('"Cancelar" cierra sin enviar la decisión', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular('ninguno');
    const onCerrar = vi.fn();
    render(<DecidirAprobacionDialog ficha={FICHA} acepta onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('mientras envía el botón de confirmar queda en carga y no admite otro envío', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular('ninguno', { isPending: true });
    render(<DecidirAprobacionDialog ficha={FICHA} acepta onCerrar={vi.fn()} />);
    const confirmar = screen.getByRole('button', { name: /Procesando/ });

    // Act
    await user.click(confirmar);

    // Assert
    expect(confirmar).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });
});
