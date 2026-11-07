import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useAsesoresProyecto } from '../../hooks/useAsesoresProyecto';
import { useAsignarTarea } from '../../hooks/useAsignarTarea';
import AsignarTareaPanel from './AsignarTareaPanel';

vi.mock('../../hooks/useAsignarTarea', () => ({ useAsignarTarea: vi.fn() }));
vi.mock('../../hooks/useAsesoresProyecto', () => ({ useAsesoresProyecto: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();
const refetchAsesores = vi.fn();

const MAPA = {
  id: 'm-1',
  proyectoGradoId: 'p-1',
  titulo: 'Sistema A',
  fechaInicio: '2026-03-05',
  fechaFin: '2026-08-01',
};

const ASESORES = [
  { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co', estadoId: 'ASIGNADO', actual: true },
  { id: 'a-2', nombre: 'Luis Mora', email: 'luis@uco.edu.co', estadoId: 'ASIGNADO', actual: true },
];

function simularAsesores(parcial: Partial<ReturnType<typeof useAsesoresProyecto>> = {}) {
  vi.mocked(useAsesoresProyecto).mockReturnValue({
    data: ASESORES,
    isLoading: false,
    isError: false,
    refetch: refetchAsesores,
    ...parcial,
  } as ReturnType<typeof useAsesoresProyecto>);
}

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'crudo', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function llenar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /Descripción/ }), 'Entregar informe');
  await user.click(screen.getByRole('radio', { name: /Luis Mora/ }));
  await user.click(screen.getByRole('button', { name: 'Asignar tarea' }));
}

describe('AsignarTareaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAsignarTarea).mockReturnValue({
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
    simularAsesores();
  });

  it('enviar vacío muestra el resumen con Descripción y Asesor y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsignarTareaPanel mapa={MAPA} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar tarea' }));

    // Assert
    expect(await screen.findByRole('button', { name: /^Descripción:/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Asesor:/ })).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al enviar llama a la mutación, avisa con toast de éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    render(<AsignarTareaPanel mapa={MAPA} onCerrar={onCerrar} />);

    // Act
    await llenar(user);

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { mapaRutaId: 'm-1', req: { descripcion: 'Entregar informe', asesorId: 'a-2' } },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Tarea asignada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con TAREA_DUPLICADA pinta el error bajo Descripción, avisa y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('TAREA_DUPLICADA')),
    );
    render(<AsignarTareaPanel mapa={MAPA} onCerrar={onCerrar} />);

    // Act
    await llenar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveAccessibleDescription(
      /Ya hay una tarea con esa descripción/,
    );
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveValue('Entregar informe');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con ASESOR_NO_ASIGNADO_PROYECTO_GRADO pinta el error bajo Asesor', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('ASESOR_NO_ASIGNADO_PROYECTO_GRADO')),
    );
    render(<AsignarTareaPanel mapa={MAPA} onCerrar={vi.fn()} />);

    // Act
    await llenar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('radiogroup', { name: 'Asesor' })).toHaveAccessibleDescription(
      /no está asignado a tu proyecto/,
    );
  });

  it('con MAPA_RUTA_NO_ENCONTRADO avisa con toast y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('MAPA_RUTA_NO_ENCONTRADO')),
    );
    render(<AsignarTareaPanel mapa={MAPA} onCerrar={onCerrar} />);

    // Act
    await llenar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('sin asesores asignados muestra el aviso', () => {
    // Arrange
    simularAsesores({ data: [] });

    // Act
    render(<AsignarTareaPanel mapa={MAPA} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText(/aún no tiene asesores asignados/)).toBeInTheDocument();
  });

  it('con error de asesores muestra el aviso y Reintentar recarga', async () => {
    // Arrange
    simularAsesores({ data: undefined, isError: true });
    const user = userEvent.setup();
    render(<AsignarTareaPanel mapa={MAPA} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByText('No pudimos cargar los asesores de tu proyecto')).toBeInTheDocument();
    expect(refetchAsesores).toHaveBeenCalled();
  });
});
