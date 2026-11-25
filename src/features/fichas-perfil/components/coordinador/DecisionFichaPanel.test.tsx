import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useAgregarEstadoAprobacionFichaPerfil } from '../../hooks/useAgregarEstadoAprobacionFichaPerfil';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import DecisionFichaPanel from './DecisionFichaPanel';

vi.mock('../../hooks/useAgregarEstadoAprobacionFichaPerfil', () => ({
  useAgregarEstadoAprobacionFichaPerfil: vi.fn(),
}));
vi.mock('../../hooks/useEvaluacionesFichaCoordinador', () => ({
  useEvaluacionesFichaCoordinador: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

function crearErrorApi(message: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {
      error: 'Unprocessable Entity',
      errorCode: 'ESTADO_FICHA_PERFIL_EVALUACION_EN_CURSO',
      message,
      status: 422,
    },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type Opciones = { onSuccess?: () => void; onError?: (err: Error) => void };

function mockMutacion(mutate: (acepta: boolean, opciones?: Opciones) => void) {
  vi.mocked(useAgregarEstadoAprobacionFichaPerfil).mockReturnValue({
    mutate,
    isPending: false,
  } as never);
}

function mockEvaluaciones(estados: string[] | 'cargando' | 'error') {
  const resultado =
    estados === 'cargando'
      ? { data: undefined, isLoading: true, isError: false }
      : estados === 'error'
        ? { data: undefined, isLoading: false, isError: true }
        : {
            data: estados.map((id) => ({
              estadoEvaluacionId: id,
              estadoEvaluacionNombre: id === 'APROBADA' ? 'Aprobada' : id,
            })),
            isLoading: false,
            isError: false,
          };
  vi.mocked(useEvaluacionesFichaCoordinador).mockReturnValue(resultado as never);
}

const aprobar = () => screen.getByRole('radio', { name: 'Aprobar la ficha' });
const noAprobar = () => screen.getByRole('radio', { name: 'No aprobar la ficha' });
const registrar = () => screen.getByRole('button', { name: 'Registrar decisión' });
const enDialogo = (rol: 'dialog' | 'alertdialog', nombre: string) =>
  within(screen.getByRole(rol)).getByRole('button', { name: nombre });

describe('DecisionFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEvaluaciones(['APROBADA', 'APROBADA', 'DESCARTADA']);
    mockMutacion(vi.fn());
  });

  it('resume las evaluaciones y exige elegir una decisión antes de registrar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(registrar());

    // Assert
    expect(screen.getByText('2 Aprobada')).toBeInTheDocument();
    expect(screen.getByText('1 DESCARTADA')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Elige una decisión para continuar.');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('aprobar pide confirmación, cancelar no registra y confirmar registra con acepta true', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_a: boolean, o?: Opciones) => o?.onSuccess?.());
    mockMutacion(mutate);
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(aprobar());
    await user.click(registrar());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(useAgregarEstadoAprobacionFichaPerfil).toHaveBeenCalledWith('f-1');
    expect(mutate).not.toHaveBeenCalled();

    // Act
    await user.click(registrar());
    await user.click(enDialogo('dialog', 'Aprobar ficha'));

    // Assert
    expect(mutate).toHaveBeenCalledWith(true, expect.any(Object));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('no aprobar confirma con acepta false', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_a: boolean, o?: Opciones) => o?.onSuccess?.());
    mockMutacion(mutate);
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(noAprobar());
    await user.click(registrar());
    await user.click(enDialogo('alertdialog', 'No aprobar ficha'));

    // Assert
    expect(mutate).toHaveBeenCalledWith(false, expect.any(Object));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('si el backend rechaza muestra el error en un toast y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(
      vi.fn((_a: boolean, o?: Opciones) =>
        o?.onError?.(crearErrorApi('Hay 1 evaluación en curso')),
      ),
    );
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(aprobar());
    await user.click(registrar());
    await user.click(enDialogo('dialog', 'Aprobar ficha'));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la decisión',
      'Hay 1 evaluación en curso',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sin evaluaciones finalizadas deshabilita las opciones y el botón con su aviso', () => {
    // Arrange
    mockEvaluaciones(['DESCARTADA']);

    // Act
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeDisabled();
    expect(registrar()).toBeDisabled();
    expect(
      screen.getByText('Podrás decidir cuando al menos una evaluación esté finalizada.'),
    ).toBeInTheDocument();
  });

  it('con una evaluación en curso y otra aprobada deshabilita decidir y avisa cuántas siguen en curso', () => {
    // Arrange
    mockEvaluaciones(['APROBADA', 'EN_EVALUACION']);

    // Act
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeDisabled();
    expect(registrar()).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent(
      'Hay 1 evaluación en curso. Podrás decidir cuando todas estén finalizadas o descartadas.',
    );
    expect(screen.queryByText(/al menos una evaluación esté finalizada/)).not.toBeInTheDocument();
  });

  it('con evaluaciones finalizadas y ninguna en curso deja «No aprobar» habilitada', () => {
    // Arrange
    mockEvaluaciones(['NO_APROBADA', 'DESCARTADA']);

    // Act
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(noAprobar()).toBeEnabled();
    expect(screen.queryByText(/en curso/)).not.toBeInTheDocument();
  });

  it('con todas las evaluaciones descartadas pide al menos una finalizada', () => {
    // Arrange
    mockEvaluaciones(['DESCARTADA', 'DESCARTADA']);

    // Act
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeDisabled();
    expect(
      screen.getByText('Podrás decidir cuando al menos una evaluación esté finalizada.'),
    ).toBeInTheDocument();
  });

  it('con evaluaciones solo no aprobadas deshabilita únicamente aprobar', () => {
    // Arrange
    mockEvaluaciones(['NO_APROBADA']);

    // Act
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeEnabled();
    expect(screen.getByRole('note')).toHaveTextContent(
      'Para aprobar la ficha, al menos una evaluación debe estar aprobada.',
    );
  });

  it('mientras cargan las evaluaciones las opciones están deshabilitadas y si fallan quedan habilitadas con aviso', () => {
    // Arrange
    mockEvaluaciones('cargando');
    const { unmount } = render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeDisabled();

    // Act
    unmount();
    mockEvaluaciones('error');
    render(<DecisionFichaPanel fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeEnabled();
    expect(noAprobar()).toBeEnabled();
    expect(screen.getByRole('note')).toHaveTextContent('No pudimos revisar las evaluaciones');
  });
});
