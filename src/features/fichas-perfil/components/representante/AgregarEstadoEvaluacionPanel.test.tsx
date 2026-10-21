import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
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

function renderizar() {
  return render(<AgregarEstadoEvaluacionPanel evaluacionId="ev-1" fichaPerfilId="f-1" />);
}

async function confirmar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Registrar estado' }),
  );
}

async function elegirYRegistrar(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByRole('combobox', { name: 'Estado' }), 'APROBADA');
  await user.click(screen.getByRole('button', { name: 'Registrar estado' }));
}

describe('AgregarEstadoEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutate.mockReset();
    mockCatalogo();
    mockMutacion();
  });

  it('ofrece solo los tres estados finales y no deshabilita el envío por validez', () => {
    // Act
    renderizar();

    // Assert
    const opciones = screen.getAllByRole('option').map((o) => o.textContent);
    expect(opciones).toEqual([
      'Selecciona un estado...',
      'Aprobada',
      'Aprobada Con Observaciones',
      'No Aprobada',
    ]);
    expect(screen.getByRole('button', { name: 'Registrar estado' })).toBeEnabled();
  });

  it('al enviar sin elegir estado muestra el resumen de errores, lleva al campo y no pide confirmación', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar estado' }));

    // Assert
    expect(screen.getByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: /^Estado: / }));

    // Assert
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveFocus();
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
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveValue('');
  });

  it('notifica el error de la API con un toast, cierra el diálogo y conserva la selección', async () => {
    // Arrange
    mutate.mockImplementation((_req, opts) => opts.onError(new Error('x')));
    const user = userEvent.setup();
    renderizar();

    // Act
    await elegirYRegistrar(user);
    await confirmar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al registrar el estado', expect.any(String));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveValue('APROBADA');
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

  it('muestra el envío en curso con el selector y el botón deshabilitados', () => {
    // Arrange
    mockMutacion({ isPending: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('combobox', { name: 'Estado' })).toBeDisabled();
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
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los estados');
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
