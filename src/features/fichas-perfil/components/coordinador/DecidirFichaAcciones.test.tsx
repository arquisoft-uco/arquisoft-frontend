import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useAgregarEstadoAprobacionFichaPerfil } from '../../hooks/useAgregarEstadoAprobacionFichaPerfil';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import DecidirFichaAcciones from './DecidirFichaAcciones';

vi.mock('../../hooks/useAgregarEstadoAprobacionFichaPerfil', () => ({
  useAgregarEstadoAprobacionFichaPerfil: vi.fn(),
}));
vi.mock('../../hooks/useEvaluacionesFichaCoordinador', () => ({
  useEvaluacionesFichaCoordinador: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Opciones = { onSuccess?: () => void; onError?: (err: Error) => void };

function mockMutacion(mutate: (acepta: boolean, opciones?: Opciones) => void, isPending = false) {
  vi.mocked(useAgregarEstadoAprobacionFichaPerfil).mockReturnValue({ mutate, isPending } as never);
}

function mockEvaluaciones(estados: string[] | 'cargando' | 'error') {
  const resultado =
    estados === 'cargando'
      ? { data: undefined, isLoading: true, isError: false }
      : estados === 'error'
        ? { data: undefined, isLoading: false, isError: true }
        : {
            data: estados.map((id) => ({ estadoEvaluacionId: id })),
            isLoading: false,
            isError: false,
          };
  vi.mocked(useEvaluacionesFichaCoordinador).mockReturnValue(resultado as never);
}

const aprobar = () => screen.getByRole('button', { name: 'Aprobar ficha' });
const noAprobar = () => screen.getByRole('button', { name: 'No aprobar ficha' });
const enDialogo = (nombre: string) =>
  within(screen.getByRole(nombre === 'Aprobar ficha' ? 'dialog' : 'alertdialog')).getByRole(
    'button',
    { name: nombre },
  );

describe('DecidirFichaAcciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEvaluaciones(['APROBADA']);
    mockMutacion(vi.fn());
  });

  it('"Aprobar ficha" pide confirmación, cancelar no registra y confirmar registra con acepta true', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_a: boolean, o?: Opciones) => o?.onSuccess?.());
    mockMutacion(mutate);
    render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Act
    await user.click(aprobar());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(useAgregarEstadoAprobacionFichaPerfil).toHaveBeenCalledWith('f-1');
    expect(mutate).not.toHaveBeenCalled();

    // Act
    await user.click(aprobar());
    await user.click(enDialogo('Aprobar ficha'));

    // Assert
    expect(mutate).toHaveBeenCalledWith(true, expect.any(Object));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('"No aprobar ficha" confirma con acepta false', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_a: boolean, o?: Opciones) => o?.onSuccess?.());
    mockMutacion(mutate);
    render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Act
    await user.click(noAprobar());
    await user.click(enDialogo('No aprobar ficha'));

    // Assert
    expect(mutate).toHaveBeenCalledWith(false, expect.any(Object));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('si el backend rechaza muestra el error en un toast y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(vi.fn((_a: boolean, o?: Opciones) => o?.onError?.(new Error('x'))));
    render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Act
    await user.click(aprobar());
    await user.click(enDialogo('Aprobar ficha'));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la decisión',
      expect.any(String),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('sin evaluaciones finalizadas deshabilita ambos botones con su aviso', () => {
    // Arrange
    mockEvaluaciones(['EN_EVALUACION', 'DESCARTADA']);

    // Act
    render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeDisabled();
    expect(
      screen.getByText('Podrás decidir cuando al menos una evaluación esté finalizada.'),
    ).toBeInTheDocument();
  });

  it('con evaluaciones solo no aprobadas deshabilita únicamente "Aprobar ficha"', () => {
    // Arrange
    mockEvaluaciones(['NO_APROBADA']);

    // Act
    render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeEnabled();
    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it('mientras cargan las evaluaciones los botones están deshabilitados y si fallan quedan habilitados', () => {
    // Arrange
    mockEvaluaciones('cargando');
    const { unmount } = render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeDisabled();

    // Act
    unmount();
    mockEvaluaciones('error');
    render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeEnabled();
    expect(noAprobar()).toBeEnabled();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('mientras se envía los botones están deshabilitados', () => {
    // Arrange
    mockMutacion(vi.fn(), true);

    // Act
    render(<DecidirFichaAcciones fichaPerfilId="f-1" />);

    // Assert
    expect(aprobar()).toBeDisabled();
    expect(noAprobar()).toBeDisabled();
  });
});
