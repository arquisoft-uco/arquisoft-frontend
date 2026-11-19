import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useAgregarPlanEstimado } from '../../hooks/useAgregarPlanEstimado';
import AgregarPlanEstimadoPanel from './AgregarPlanEstimadoPanel';

vi.mock('../../hooks/useAgregarPlanEstimado', () => ({ useAgregarPlanEstimado: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();

const TAREA = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

function errorApi(errorCode: string, message = 'Excede el plazo: 40 días') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function enviarConDias(user: ReturnType<typeof userEvent.setup>, dias: string) {
  await user.type(screen.getByRole('textbox', { name: /Días estimados/ }), dias);
  await user.click(screen.getByRole('button', { name: 'Agregar plan estimado' }));
}

describe('AgregarPlanEstimadoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAgregarPlanEstimado).mockReturnValue({
      mutate,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      data: undefined,
      error: null,
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      isError: false,
      isIdle: true,
      isPaused: false,
      isPending: false,
      isSuccess: false,
      status: 'idle',
    });
  });

  it('muestra en la ayuda el plazo del mapa de ruta en días', () => {
    // Act
    render(<AgregarPlanEstimadoPanel tarea={TAREA} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('textbox', { name: /Días estimados/ })).toHaveAccessibleDescription(
      /plazo de tu mapa de ruta es de 149 días/,
    );
  });

  it('enviar vacío muestra el resumen con Días estimados y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AgregarPlanEstimadoPanel tarea={TAREA} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Agregar plan estimado' }));

    // Assert
    expect(await screen.findByRole('button', { name: /^Días estimados:/ })).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía los días como número y sin descripción si va vacía, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    render(<AgregarPlanEstimadoPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await enviarConDias(user, '12');

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { tareaId: 't-1', req: { tiempoEstimadoDias: 12, descripcionEstimado: undefined } },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Plan estimado agregado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con EXCEDE_PLAZO pinta el mensaje bajo Días, avisa y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('PLAN_ESTIMADO_TIEMPO_EXCEDE_PLAZO')),
    );
    render(<AgregarPlanEstimadoPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await enviarConDias(user, '500');

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox', { name: /Días estimados/ })).toHaveAccessibleDescription(
      /Excede el plazo: 40 días/,
    );
    expect(screen.getByRole('textbox', { name: /Días estimados/ })).toHaveValue('500');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it.each(['PLAN_ESTIMADO_DUPLICADO', 'TAREA_NO_ENCONTRADA'])(
    'con %s avisa con toast y cierra el panel',
    async (codigo) => {
      // Arrange
      const user = userEvent.setup();
      const onCerrar = vi.fn();
      mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onError(errorApi(codigo)));
      render(<AgregarPlanEstimadoPanel tarea={TAREA} onCerrar={onCerrar} />);

      // Act
      await enviarConDias(user, '5');

      // Assert
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(onCerrar).toHaveBeenCalledTimes(1);
    },
  );
});
