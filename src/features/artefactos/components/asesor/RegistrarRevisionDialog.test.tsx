import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
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
  fechaCreacionRevision: null,
};

const VERSION_CERRADA: VersionArtefacto = {
  ...VERSION,
  revisionAsesor: 'r-3',
  estadoRevision: 'CERRADA',
  nombreEstadoRevision: 'Cerrada',
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
    expect(screen.queryByRole('note')).not.toBeInTheDocument();

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

  it('con la revisión más reciente cerrada pide reabrir con aviso y consecuencias, y al confirmar reabre, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = simular(vi.fn((_id: string, o?: OpcionesMutate) => o?.onSuccess?.()));
    render(<RegistrarRevisionDialog version={VERSION_CERRADA} onCerrar={onCerrar} />);
    const dialogo = screen.getByRole('dialog', { name: '¿Reabrir la revisión de esta versión?' });
    expect(within(dialogo).getByRole('note')).toHaveTextContent(/va por encima del ciclo de vida/);
    expect(
      within(dialogo)
        .getAllByRole('listitem')
        .map((consecuencia) => consecuencia.textContent),
    ).toEqual([
      'Se crea una nueva revisión en estado pendiente sobre esta misma versión.',
      'El artefacto se reabre.',
      'Mientras esté pendiente, los estudiantes no podrán subir versiones nuevas.',
      'No se notifica a los estudiantes.',
    ]);
    expect(screen.queryByRole('button', { name: 'Registrar revisión' })).not.toBeInTheDocument();

    // Act
    await user.click(within(dialogo).getByRole('button', { name: 'Reabrir revisión' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('v-4', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Revisión reabierta',
      'Quedó pendiente una nueva revisión de la versión 4 de «Acta de inicio».',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un error al reabrir avisa con el título de reapertura y cierra', async () => {
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
    render(<RegistrarRevisionDialog version={VERSION_CERRADA} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reabrir revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo reabrir la revisión',
      'Hay una versión más reciente: registra la revisión sobre ella.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
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
