import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarRevision } from '../../hooks/useEliminarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import EliminarRevisionDialog from './EliminarRevisionDialog';

vi.mock('../../hooks/useEliminarRevision', () => ({ useEliminarRevision: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const VERSION: VersionArtefacto = {
  proyectoFinalizado: false,
  proyectoCancelado: false,
  id: 'v-4',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: 'r-1',
  estadoRevision: 'PENDIENTE',
  nombreEstadoRevision: 'Pendiente',
  fechaCreacionRevision: null,
};

function simular(mutate = vi.fn()) {
  vi.mocked(useEliminarRevision).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useEliminarRevision>> as ReturnType<typeof useEliminarRevision>);
  return mutate;
}

function montar(onCerrar = vi.fn(), onSalir = vi.fn()) {
  render(
    <EliminarRevisionDialog
      version={VERSION}
      revisionAsesorId="r-1"
      onCerrar={onCerrar}
      onSalir={onSalir}
    />,
  );
  return { onCerrar, onSalir };
}

describe('EliminarRevisionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('explica las consecuencias y al confirmar elimina por el id de la revisión, avisa y sale', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    const { onCerrar, onSalir } = montar();
    expect(
      screen.getByRole('alertdialog', { name: '¿Eliminar esta revisión?' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Los estudiantes no reciben ningún aviso/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar revisión' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith({ revisionAsesorId: 'r-1' }, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Revisión eliminada',
      'Se eliminó la revisión de «Acta de inicio».',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).toHaveBeenCalledTimes(1);
  });

  it('con un 422 de revisión ya no eliminable avisa, cierra el diálogo y sale del panel', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, { status: 422, errorCode: 'REVISION_ASESOR_NO_ELIMINABLE', message: 'x' }),
        ),
      ),
    );
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la revisión',
      'Solo se puede eliminar una revisión que aún no se ha enviado al estudiante.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).toHaveBeenCalledTimes(1);
  });

  it('con otro error avisa y solo cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(errorApi(500, { status: 500, message: 'caído' })),
      ),
    );
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).not.toHaveBeenCalled();
  });

  it('al cancelar no llama la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular();
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).not.toHaveBeenCalled();
  });
});
