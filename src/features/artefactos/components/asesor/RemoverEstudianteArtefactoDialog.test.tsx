import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useRemoverEstudianteArtefacto } from '../../hooks/useRemoverEstudianteArtefacto';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';
import RemoverEstudianteArtefactoDialog from './RemoverEstudianteArtefactoDialog';

vi.mock('../../hooks/useRemoverEstudianteArtefacto', () => ({
  useRemoverEstudianteArtefacto: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

type Quitar = ReturnType<typeof useRemoverEstudianteArtefacto>;

function quitarMock(parcial: Partial<Quitar> = {}) {
  const mutate = vi.fn();
  const base: Partial<Quitar> = { mutate, isPending: false };
  vi.mocked(useRemoverEstudianteArtefacto).mockReturnValue(Object.assign(base, parcial) as Quitar);
  return mutate;
}

const estudiante: EstudianteArtefacto = {
  id: 'ea-1',
  artefactoId: 'a-1',
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  vigente: true,
};

function renderizar(onCerrar = vi.fn()) {
  render(
    <RemoverEstudianteArtefactoDialog
      artefactoId="a-1"
      estudiante={estudiante}
      onCerrar={onCerrar}
    />,
  );
  return onCerrar;
}

describe('RemoverEstudianteArtefactoDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide confirmación con el nombre y cancelar cierra sin llamar a la mutación', async () => {
    // Arrange
    const mutate = quitarMock();
    const user = userEvent.setup();
    const onCerrar = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText('¿Quitar a Luis Gómez del artefacto?')).toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar manda artefactoId y estudianteId (no el id del vínculo), avisa y cierra', async () => {
    // Arrange
    const mutate = quitarMock();
    mutate.mockImplementation((_req, opciones) => opciones.onSuccess());
    const user = userEvent.setup();
    const onCerrar = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar estudiante' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toEqual({ artefactoId: 'a-1', estudianteId: 'e-1' });
    expect(toast.success).toHaveBeenCalledWith('Estudiante quitado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('si falla muestra el toast con el mensaje mapeado, no el de éxito, y cierra', async () => {
    // Arrange
    const mutate = quitarMock();
    mutate.mockImplementation((_req, opciones) =>
      opciones.onError(
        errorApi(422, {
          status: 422,
          errorCode: 'ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO',
          message: 'del backend',
        }),
      ),
    );
    const user = userEvent.setup();
    const onCerrar = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar estudiante' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo quitar al estudiante',
      'El estudiante ya no está vinculado a este artefacto.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('mientras la mutación está en curso no permite confirmar de nuevo', () => {
    // Arrange
    quitarMock({ isPending: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
  });
});
