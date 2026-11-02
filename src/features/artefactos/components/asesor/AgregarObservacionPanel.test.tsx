import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarObservacion } from '../../hooks/useRegistrarObservacion';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import AgregarObservacionPanel from './AgregarObservacionPanel';

vi.mock('../../hooks/useRegistrarObservacion', () => ({ useRegistrarObservacion: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const VERSION: VersionArtefacto = {
  id: 'v-1',
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
  vi.mocked(useRegistrarObservacion).mockReturnValue({
    mutate,
    reset: vi.fn(),
    isPending: false,
  } as Partial<ReturnType<typeof useRegistrarObservacion>> as ReturnType<
    typeof useRegistrarObservacion
  >);
  return mutate;
}

function montar() {
  const onVolver = vi.fn();
  const onSalir = vi.fn();
  render(
    <AgregarObservacionPanel
      revisionAsesorId="r-1"
      version={VERSION}
      onVolver={onVolver}
      onSalir={onSalir}
    />,
  );
  return { onVolver, onSalir };
}

describe('AgregarObservacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marca la descripción como obligatoria al salir del campo y no envía', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular();
    montar();

    // Act
    await user.click(screen.getByRole('textbox', { name: /Descripción/ }));
    await user.tab();

    // Assert
    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía la descripción recortada con el id de la revisión y, al terminar, avisa y vuelve', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simular(vi.fn((_v: unknown, o?: OpcionesMutate) => o?.onSuccess?.()));
    const { onVolver } = montar();

    // Act
    await user.type(screen.getByRole('textbox', { name: /Descripción/ }), '  Falta el diagrama  ');
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { revisionAsesorId: 'r-1', descripcion: 'Falta el diagrama' },
        expect.any(Object),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Observación agregada',
      'Quedó registrada en la revisión.',
    );
    expect(onVolver).toHaveBeenCalledTimes(1);
  });

  it('una descripción repetida avisa, pinta el mensaje en el campo y conserva el texto', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(errorApi(422, { status: 422, errorCode: 'OBSERVACION_DUPLICADA' })),
      ),
    );
    const { onSalir, onVolver } = montar();

    // Act
    await user.type(screen.getByRole('textbox', { name: /Descripción/ }), 'Repetida');
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    const mensaje = 'Ya existe una observación con esta descripción en la revisión.';
    expect(await screen.findAllByText(mensaje)).not.toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith('No se pudo agregar la observación', mensaje);
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveValue('Repetida');
    expect(onSalir).not.toHaveBeenCalled();
    expect(onVolver).not.toHaveBeenCalled();
  });

  it('si la revisión ya no admite observaciones avisa y sale de todo', async () => {
    // Arrange
    const user = userEvent.setup();
    simular(
      vi.fn((_v: unknown, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, { status: 422, errorCode: 'REVISION_ASESOR_NO_ADMITE_OBSERVACIONES' }),
        ),
      ),
    );
    const { onSalir } = montar();

    // Act
    await user.type(screen.getByRole('textbox', { name: /Descripción/ }), 'Algo');
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    await waitFor(() => expect(onSalir).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo agregar la observación',
      'La revisión ya no está pendiente: no admite más observaciones.',
    );
  });
});
