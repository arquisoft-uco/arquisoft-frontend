import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
import AgregarEstadoEvaluacionPanel from './AgregarEstadoEvaluacionPanel';
import { useEstadosEvaluacion } from '../../hooks/useEstadosEvaluacion';
import { useAgregarEstadoEvaluacion } from '../../hooks/useAgregarEstadoEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';

vi.mock('../../hooks/useEstadosEvaluacion', () => ({ useEstadosEvaluacion: vi.fn() }));
vi.mock('../../hooks/useAgregarEstadoEvaluacion', () => ({
  useAgregarEstadoEvaluacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const CATALOGO = [
  { id: 'EN_EVALUACION', nombre: 'En Evaluación', descripcion: '' },
  { id: 'APROBADA', nombre: 'Aprobada', descripcion: '' },
  { id: 'APROBADA_CON_OBSERVACIONES', nombre: 'Aprobada Con Observaciones', descripcion: '' },
  { id: 'NO_APROBADA', nombre: 'No Aprobada', descripcion: '' },
  { id: 'DESCARTADA', nombre: 'Descartada', descripcion: '' },
];

const MENSAJE_NO_DISPONIBLE =
  'La ficha de perfil debe estar disponible para evaluación para realizar esta acción. Estado actual: Aprobada';

function errorFichaNoDisponible() {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {
      error: 'Unprocessable Entity',
      errorCode: 'ESTADO_FICHA_PERFIL_NO_DISPONIBLE_PARA_EVALUACION',
      message: MENSAJE_NO_DISPONIBLE,
      status: 422,
    },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const mutate = vi.fn();
const resetMutacion = vi.fn();

function mockCatalogo(overrides: Record<string, unknown> = {}) {
  vi.mocked(useEstadosEvaluacion).mockReturnValue({
    data: CATALOGO,
    isLoading: false,
    isError: false,
    ...overrides,
  } as never);
}

function mockMutacion(overrides: Record<string, unknown> = {}) {
  vi.mocked(useAgregarEstadoEvaluacion).mockReturnValue({
    mutate,
    reset: resetMutacion,
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  } as never);
}

function renderizar(cantidadObservaciones = 0, onVolver = vi.fn()) {
  return render(
    <AgregarEstadoEvaluacionPanel
      evaluacionId="ev-1"
      fichaPerfilId="f-1"
      cantidadObservaciones={cantidadObservaciones}
      onVolver={onVolver}
    />,
  );
}

async function confirmar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Registrar estado' }),
  );
}

async function elegirYRegistrar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Aprobada' }));
  await user.click(screen.getByRole('button', { name: 'Registrar estado' }));
}

describe('AgregarEstadoEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutate.mockReset();
    mockCatalogo();
    mockMutacion();
  });

  it('sin observaciones ofrece solo Aprobada y No Aprobada y lo explica bajo el título', () => {
    // Act
    renderizar(0);

    // Assert
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('value'))).toEqual([
      'APROBADA',
      'NO_APROBADA',
    ]);
    expect(
      screen.getByText('No registraste observaciones, así que puedes aprobarla o no aprobarla.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar estado' })).toBeEnabled();
  });

  it('con observaciones ofrece solo Aprobada Con Observaciones y No Aprobada y muestra la cantidad', () => {
    // Act
    renderizar(2);

    // Assert
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('value'))).toEqual([
      'APROBADA_CON_OBSERVACIONES',
      'NO_APROBADA',
    ]);
    expect(
      screen.getByText(
        'Registraste 2 observaciones, así que puedes aprobarla con observaciones o no aprobarla.',
      ),
    ).toBeInTheDocument();
  });

  it('al enviar sin elegir estado muestra el resumen de errores y no pide confirmación', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar estado' }));

    // Assert
    expect(screen.getByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('pide confirmación y, al confirmar, muta con los ids de la evaluación y el estado', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await elegirYRegistrar(user);

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();

    // Act
    await confirmar(user);

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { evaluacionFichaPerfilId: 'ev-1', estadoEvaluacionId: 'APROBADA' },
      expect.any(Object),
    );
  });

  it('«Atrás» llama a onVolver', async () => {
    // Arrange
    const user = userEvent.setup();
    const onVolver = vi.fn();
    renderizar(0, onVolver);

    // Act
    await user.click(screen.getByRole('button', { name: 'Atrás' }));

    // Assert
    expect(onVolver).toHaveBeenCalledTimes(1);
  });

  it('notifica el éxito, cierra el diálogo y reinicia la selección', async () => {
    // Arrange
    mutate.mockImplementation((_req, opts) => opts.onSuccess());
    const user = userEvent.setup();
    renderizar();

    // Act
    await elegirYRegistrar(user);
    await confirmar(user);

    // Assert
    expect(toast.success).toHaveBeenCalledWith(
      'Estado registrado',
      expect.stringContaining('Aprobada'),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Aprobada' })).not.toBeChecked();
  });

  it('notifica el error de la API con un toast, cierra el diálogo y conserva la selección', async () => {
    // Arrange
    mutate.mockImplementation((_req, opts) => opts.onError(errorFichaNoDisponible()));
    const user = userEvent.setup();
    renderizar();

    // Act
    await elegirYRegistrar(user);
    await confirmar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al registrar el estado', MENSAJE_NO_DISPONIBLE);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Aprobada' })).toBeChecked();
  });

  it('al cancelar el diálogo no muta y reinicia la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await elegirYRegistrar(user);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(resetMutacion).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el envío en curso con las opciones, «Atrás» y el botón deshabilitados', () => {
    // Arrange
    mockMutacion({ isPending: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('radio', { name: 'Aprobada' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Registrando...' })).toBeDisabled();
  });

  it('muestra carga, error de catálogo y vacío como estados distintos', () => {
    // Arrange
    mockCatalogo({ data: undefined, isLoading: true });

    // Act
    const { unmount } = renderizar();

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados…');
    unmount();

    // Arrange
    mockCatalogo({ data: undefined, isError: true });

    // Act
    const { unmount: unmountError } = renderizar();

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los estados disponibles. Intenta nuevamente.',
    );
    unmountError();

    // Arrange
    mockCatalogo({ data: [CATALOGO[0], CATALOGO[4]] });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('No hay estados disponibles para registrar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar estado' })).toBeDisabled();
  });
});
