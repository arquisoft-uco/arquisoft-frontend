import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarRevision } from '../../hooks/useRegistrarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import RegistrarRevisionDialog from './RegistrarRevisionDialog';

vi.mock('../../hooks/useRegistrarRevision', () => ({ useRegistrarRevision: vi.fn() }));
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
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
};

function simular(mutate = vi.fn()) {
  vi.mocked(useRegistrarRevision).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useRegistrarRevision>> as ReturnType<typeof useRegistrarRevision>);
  return mutate;
}

describe('RegistrarRevisionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('explica las consecuencias sin la de reapertura y, al confirmar, registra por id, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = simular(vi.fn((_id: string, o?: OpcionesMutate) => o?.onSuccess?.()));
    render(<RegistrarRevisionDialog version={VERSION} onCerrar={onCerrar} />);
    expect(screen.getByRole('dialog', { name: '¿Registrar revisión?' })).toBeInTheDocument();
    expect(screen.getByText(/no se notifica a los estudiantes/)).toBeInTheDocument();
    expect(screen.getByText(/no podrán subir versiones nuevas/)).toBeInTheDocument();
    expect(screen.queryByText(/reabre el artefacto/)).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar revisión' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('v-4', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Revisión registrada',
      'Quedó pendiente la revisión de la versión 4 de «Acta de inicio».',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con la revisión más reciente cerrada advierte que registrar reabre el artefacto', () => {
    // Arrange
    simular();

    // Act
    render(
      <RegistrarRevisionDialog
        version={{ ...VERSION, estadoRevision: 'CERRADA', nombreEstadoRevision: 'Cerrada' }}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText(/registrar una nueva reabre el artefacto/)).toBeInTheDocument();
  });

  it('ante un error avisa con el mensaje claro y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    simular(
      vi.fn((_id: string, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, {
            status: 422,
            errorCode: 'VERSION_ARTEFACTO_NO_ES_ULTIMA',
            message: 'del backend',
          }),
        ),
      ),
    );
    render(<RegistrarRevisionDialog version={VERSION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la revisión',
      'Hay una versión más reciente: registra la revisión sobre ella.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra sin registrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = simular();
    render(<RegistrarRevisionDialog version={VERSION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
