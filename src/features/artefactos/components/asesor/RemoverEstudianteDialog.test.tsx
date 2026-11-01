import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useRemoverEstudiante } from '../../hooks/useRemoverEstudiante';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';
import RemoverEstudianteDialog from './RemoverEstudianteDialog';

vi.mock('../../hooks/useRemoverEstudiante', () => ({ useRemoverEstudiante: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const ARTEFACTO: ArtefactoAsesor = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  omitido: false,
};

const ESTUDIANTE: EstudianteArtefacto = {
  id: 'ea-1',
  artefactoId: 'a-1',
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  vigente: true,
};

function simular(mutate = vi.fn()) {
  vi.mocked(useRemoverEstudiante).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useRemoverEstudiante>> as ReturnType<typeof useRemoverEstudiante>);
  return mutate;
}

describe('RemoverEstudianteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('al confirmar quita por estudianteId, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    render(
      <RemoverEstudianteDialog artefacto={ARTEFACTO} estudiante={ESTUDIANTE} onCerrar={onCerrar} />,
    );
    expect(screen.getByRole('alertdialog', { name: '¿Quitar estudiante?' })).toBeInTheDocument();
    expect(screen.getByText(/recibirá un correo/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar estudiante' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { artefactoId: 'a-1', estudianteId: 'e-1' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Estudiante quitado',
      'Luis Gómez ya no está vinculado a «Acta de inicio».',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un error avisa con el mensaje del servidor y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, { status: 422, errorCode: 'OTRO', message: 'Ya no está vinculado' }),
        ),
      ),
    );
    render(
      <RemoverEstudianteDialog artefacto={ARTEFACTO} estudiante={ESTUDIANTE} onCerrar={onCerrar} />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar estudiante' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo quitar al estudiante',
      'Ya no está vinculado',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
