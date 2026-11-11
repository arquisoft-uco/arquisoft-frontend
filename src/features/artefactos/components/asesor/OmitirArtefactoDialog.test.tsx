import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useOmitirArtefacto } from '../../hooks/useOmitirArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import OmitirArtefactoDialog from './OmitirArtefactoDialog';

vi.mock('../../hooks/useOmitirArtefacto', () => ({ useOmitirArtefacto: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const ARTEFACTO: ArtefactoAsesor = {
  proyectoFinalizado: false,
  proyectoCancelado: false,
  id: '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  omitido: false,
};

function simular(mutate = vi.fn()) {
  vi.mocked(useOmitirArtefacto).mockReturnValue({
    mutate,
    isPending: false,
  } as Partial<ReturnType<typeof useOmitirArtefacto>> as ReturnType<typeof useOmitirArtefacto>);
  return mutate;
}

describe('OmitirArtefactoDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('explica las consecuencias y, al confirmar, omite por id, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = simular(vi.fn((_id: string, o?: OpcionesMutate) => o?.onSuccess?.()));
    render(<OmitirArtefactoDialog artefacto={ARTEFACTO} onCerrar={onCerrar} />);
    expect(screen.getByRole('dialog', { name: '¿Omitir artefacto?' })).toBeInTheDocument();
    expect(screen.getByText(/recibirán un correo/)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Omitir artefacto' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(ARTEFACTO.id, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Artefacto omitido',
      '«Acta de inicio» quedó omitido en «Sistema de riego».',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un error avisa con el mensaje del servidor y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    simular(
      vi.fn((_id: string, o?: OpcionesMutate) =>
        o?.onError?.(
          errorApi(422, { status: 422, errorCode: 'OTRO', message: 'No eres el asesor' }),
        ),
      ),
    );
    render(<OmitirArtefactoDialog artefacto={ARTEFACTO} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Omitir artefacto' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo omitir el artefacto', 'No eres el asesor');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra sin omitir', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = simular();
    render(<OmitirArtefactoDialog artefacto={ARTEFACTO} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
