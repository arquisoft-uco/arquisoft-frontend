import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useCambiarEstadoObservacion } from '../../hooks/useCambiarEstadoObservacion';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import CambiarEstadoObservacionDialog from './CambiarEstadoObservacionDialog';

vi.mock('../../hooks/useCambiarEstadoObservacion', () => ({
  useCambiarEstadoObservacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const OBSERVACION: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-1',
  descripcion: 'Corregir la portada',
  estadoId: 'SOLUCIONADA',
  estadoNombre: 'Solucionada',
};

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
  estadoRevision: 'RESUELTA',
  nombreEstadoRevision: 'Resuelta',
};

function simular(mutate = vi.fn()) {
  vi.mocked(useCambiarEstadoObservacion).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useCambiarEstadoObservacion>> as ReturnType<
    typeof useCambiarEstadoObservacion
  >);
  return mutate;
}

function montar(estado: 'CERRADA' | 'REABIERTA') {
  const onCerrar = vi.fn();
  const onSalir = vi.fn();
  render(
    <CambiarEstadoObservacionDialog
      observacion={OBSERVACION}
      estado={estado}
      version={VERSION}
      revisionAsesorId="r-1"
      onCerrar={onCerrar}
      onSalir={onSalir}
    />,
  );
  return { onCerrar, onSalir };
}

function falla(errorCode: string) {
  return vi.fn((_v: unknown, o?: OpcionesMutate) =>
    o?.onError?.(errorApi(422, { status: 422, errorCode, message: 'del backend' })),
  );
}

describe('CambiarEstadoObservacionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cerrar avisa que no hay correo y al confirmar manda CERRADA, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    const { onCerrar, onSalir } = montar('CERRADA');
    expect(screen.getByText('¿Cerrar observación?')).toBeInTheDocument();
    expect(screen.getByText(/No se envía correo/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar observación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { observacionId: 'o-1', revisionAsesorId: 'r-1', estado: 'CERRADA' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Observación cerrada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).not.toHaveBeenCalled();
  });

  it('reabrir anuncia el correo y al confirmar manda REABIERTA y avisa', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    const { onCerrar } = montar('REABIERTA');
    expect(screen.getByText(/Se envía un correo a los estudiantes/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reabrir observación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { observacionId: 'o-1', revisionAsesorId: 'r-1', estado: 'REABIERTA' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Observación reabierta',
      'Se creó una observación nueva en la revisión de la versión 5.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('un 422 mapeado avisa y cierra sin salir', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(falla('REVISION_ASESOR_VERSION_SIGUIENTE_ENVIADA'));
    const { onCerrar, onSalir } = montar('REABIERTA');

    // Act
    await user.click(screen.getByRole('button', { name: 'Reabrir observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo reabrir la observación',
      expect.stringContaining('ya se envió'),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).not.toHaveBeenCalled();
  });

  it('con artefacto omitido avisa, cierra y sale', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(falla('ARTEFACTOS_ARTEFACTO_OMITIDO'));
    const { onCerrar, onSalir } = montar('CERRADA');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cerrar la observación',
      'El artefacto está omitido y no admite cambios.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onSalir).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra sin llamar a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular();
    const { onCerrar } = montar('CERRADA');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
