import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useEnviarRevision } from '../../hooks/useEnviarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import EnviarRevisionDialog from './EnviarRevisionDialog';

vi.mock('../../hooks/useEnviarRevision', () => ({ useEnviarRevision: vi.fn() }));
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
};

function simular(mutate = vi.fn()) {
  vi.mocked(useEnviarRevision).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useEnviarRevision>> as ReturnType<typeof useEnviarRevision>);
  return mutate;
}

function montar(onCerrar = vi.fn(), onSalir = vi.fn()) {
  render(
    <EnviarRevisionDialog
      version={VERSION}
      revisionAsesorId="r-1"
      onCerrar={onCerrar}
      onSalir={onSalir}
    />,
  );
  return { onCerrar, onSalir };
}

describe('EnviarRevisionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('avisa del correo, y al confirmar envía por el id de la revisión, avisa, cierra y sale', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    const { onCerrar, onSalir } = montar();
    expect(screen.getByRole('dialog', { name: '¿Enviar revisión?' })).toBeInTheDocument();
    expect(screen.getByText(/Se envía un correo a los estudiantes/)).toBeInTheDocument();
    expect(screen.getByText(/ya no se podrán cambiar/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar revisión' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith({ revisionAsesorId: 'r-1' }, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Revisión enviada',
      'Los estudiantes recibirán un correo con las observaciones de la versión 4 de «Acta de inicio».',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).toHaveBeenCalledTimes(1);
  });

  it('con un 422 de revisión ya no enviable avisa, cierra y también sale', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, {
            status: 422,
            errorCode: 'REVISION_ASESOR_NO_ENVIABLE',
            message: 'del backend',
          }),
        ),
      ),
    );
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo enviar la revisión',
      'Esta revisión ya no está pendiente: ya se envió.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).toHaveBeenCalledTimes(1);
  });

  it('con el 422 de revisión sin observaciones avisa, cierra la confirmación y no sale del panel', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, {
            status: 422,
            errorCode: 'REVISION_ASESOR_SIN_OBSERVACIONES',
            message: 'del backend',
          }),
        ),
      ),
    );
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo enviar la revisión',
      'La revisión no tiene observaciones. Agrega al menos una para poder enviarla.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).not.toHaveBeenCalled();
  });

  it('con otro error avisa y cierra sin salir', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onError?.(new Error('red'))));
    const { onCerrar, onSalir } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo enviar la revisión', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).not.toHaveBeenCalled();
  });

  it('al cancelar cierra sin enviar', async () => {
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
