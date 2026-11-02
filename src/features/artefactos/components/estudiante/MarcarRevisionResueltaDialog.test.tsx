import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MutationFunctionContext } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useMarcarRevisionResuelta } from '../../hooks/useMarcarRevisionResuelta';
import { useObservacionesRevisionEstudiante } from '../../hooks/useObservacionesRevisionEstudiante';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import MarcarRevisionResueltaDialog from './MarcarRevisionResueltaDialog';

vi.mock('../../hooks/useMarcarRevisionResuelta', () => ({ useMarcarRevisionResuelta: vi.fn() }));
vi.mock('../../hooks/useObservacionesRevisionEstudiante', () => ({
  useObservacionesRevisionEstudiante: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

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
  estadoRevision: 'EN_PROGRESO',
  nombreEstadoRevision: 'En progreso',
};

const contexto = {} as MutationFunctionContext;

type Resultado = ReturnType<typeof useMarcarRevisionResuelta>;

type Opciones = Parameters<Resultado['mutate']>[1];

function montar(resultado: 'exito' | { error: unknown } | 'ninguno' = 'ninguno') {
  const mutate = vi.fn((_req: unknown, opciones?: Opciones) => {
    if (resultado === 'exito')
      opciones?.onSuccess?.(undefined, { revisionAsesorId: '' }, undefined, contexto);
    else if (resultado !== 'ninguno')
      opciones?.onError?.(resultado.error, { revisionAsesorId: '' }, undefined, contexto);
  });
  const base: Partial<Resultado> = { mutate, isPending: false };
  vi.mocked(useMarcarRevisionResuelta).mockReturnValue(Object.assign(base) as Resultado);
  const onCerrar = vi.fn();
  render(<MarcarRevisionResueltaDialog version={VERSION} onCerrar={onCerrar} />);
  return { mutate, onCerrar };
}

describe('MarcarRevisionResueltaDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const base: Partial<ReturnType<typeof useObservacionesRevisionEstudiante>> = {
      data: [],
      isLoading: false,
    };
    vi.mocked(useObservacionesRevisionEstudiante).mockReturnValue(
      Object.assign(base) as ReturnType<typeof useObservacionesRevisionEstudiante>,
    );
  });

  it('al confirmar muta con el id de la revisión, avisa con toast de éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate, onCerrar } = montar('exito');

    // Act
    await user.click(screen.getByRole('button', { name: 'Marcar como resuelta' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toEqual({ revisionAsesorId: 'r-1' });
    expect(toast.success).toHaveBeenCalledWith('Revisión marcada como resuelta');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante sin versión posterior muestra el toast con el texto del cliente y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar } = montar({
      error: errorApi(422, { errorCode: 'REVISION_ASESOR_SIN_VERSION_POSTERIOR', message: 'x' }),
    });

    // Act
    await user.click(screen.getByRole('button', { name: 'Marcar como resuelta' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo marcar como resuelta',
      'Primero sube una nueva versión del artefacto',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cancelar cierra sin mutar', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate, onCerrar } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con observaciones abiertas muestra el aviso y deshabilita confirmar', () => {
    // Arrange
    const obs = (id: string, estadoId: string) => ({
      id,
      revisionAsesorId: 'r-1',
      descripcion: id,
      estadoId,
      estadoNombre: estadoId,
    });
    const abiertas: Partial<ReturnType<typeof useObservacionesRevisionEstudiante>> = {
      data: [obs('o-1', 'NUEVA'), obs('o-2', 'REABIERTA'), obs('o-3', 'SOLUCIONADA')],
      isLoading: false,
    };
    vi.mocked(useObservacionesRevisionEstudiante).mockReturnValue(
      Object.assign(abiertas) as ReturnType<typeof useObservacionesRevisionEstudiante>,
    );

    // Act
    montar();

    // Assert
    expect(screen.getByText(/Tienes 2 observaciones sin solucionar/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcar como resuelta' })).toBeDisabled();
  });

  it('sin observaciones abiertas confirmar está habilitado y no hay aviso', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByRole('button', { name: 'Marcar como resuelta' })).toBeEnabled();
    expect(screen.queryByText(/sin solucionar/)).not.toBeInTheDocument();
  });

  it('ante el 422 de observaciones abiertas muestra el toast con el mensaje propio', async () => {
    // Arrange
    const user = userEvent.setup();
    montar({
      error: errorApi(422, {
        errorCode: 'REVISION_ASESOR_CON_OBSERVACIONES_ABIERTAS',
        message: 'x',
      }),
    });

    // Act
    await user.click(screen.getByRole('button', { name: 'Marcar como resuelta' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo marcar como resuelta',
      expect.stringContaining('observaciones sin solucionar'),
    );
  });
});
