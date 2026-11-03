import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useCerrarRevision } from '../../hooks/useCerrarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import CerrarRevisionDialog from './CerrarRevisionDialog';

vi.mock('../../hooks/useCerrarRevision', () => ({ useCerrarRevision: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const VERSION: VersionArtefacto = {
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
  vi.mocked(useCerrarRevision).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useCerrarRevision>> as ReturnType<typeof useCerrarRevision>);
  return mutate;
}

function montar(onCerrar = vi.fn(), onSalir = vi.fn()) {
  render(
    <CerrarRevisionDialog
      version={VERSION}
      revisionAsesorId="r-1"
      onCerrar={onCerrar}
      onSalir={onSalir}
    />,
  );
  return { onCerrar, onSalir };
}

describe('CerrarRevisionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('explica las consecuencias y al confirmar cierra por el id de la revisión, avisa y sale', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    const { onCerrar, onSalir } = montar();
    expect(
      screen.getByRole('dialog', { name: '¿Dar por completado este artefacto?' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/ya no podrán subir nuevas versiones/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar por completado' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith({ revisionAsesorId: 'r-1' }, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Artefacto completado',
      'Los estudiantes recibirán un correo con el aviso de «Acta de inicio».',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).toHaveBeenCalledTimes(1);
  });

  it('con un 422 por observaciones avisa y solo cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, {
            status: 422,
            errorCode: 'REVISION_ASESOR_CON_OBSERVACIONES',
            message: 'x',
          }),
        ),
      ),
    );
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar por completado' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo dar por completado',
      'La revisión tiene observaciones. Elimínalas antes de darla por completada.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).not.toHaveBeenCalled();
  });

  it('con un 422 de revisión ya no cerrable avisa, cierra y también sale', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, { status: 422, errorCode: 'REVISION_ASESOR_NO_CERRABLE', message: 'x' }),
        ),
      ),
    );
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar por completado' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).toHaveBeenCalledTimes(1);
  });

  it('al cancelar no llama la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular();
    const { onCerrar } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
