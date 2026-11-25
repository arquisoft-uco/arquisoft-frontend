import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import AsignarAsesorEvaluacionPanel from './AsignarAsesorEvaluacionPanel';
import { useAsesoresVigentes } from '../../../../shared/hooks/useAsesoresVigentes';
import { useAsignarAsesorEvaluacion } from '../../hooks/useAsignarAsesorEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import type { Evaluacion } from '../../models/Evaluacion';

vi.mock('../../../../shared/hooks/useAsesoresVigentes', () => ({ useAsesoresVigentes: vi.fn() }));
vi.mock('../../hooks/useAsignarAsesorEvaluacion', () => ({
  useAsignarAsesorEvaluacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const EVALUACION: Evaluacion = {
  id: 'e-1',
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  estado: { id: 'PENDIENTE', nombre: 'Pendiente' },
  notas: { notaAsesor: null, notaJurados: null, notaFinal: null },
  resultado: null,
};

const ASESORES = [
  { id: 'a-1', nombre: 'Ana Gómez', email: 'ana@uco.edu.co' },
  { id: 'a-2', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' },
];

function mockAsesores(parcial: Partial<ReturnType<typeof useAsesoresVigentes>> = {}) {
  vi.mocked(useAsesoresVigentes).mockReturnValue({
    data: ASESORES,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useAsesoresVigentes>);
}

function mockMutacion(mutate = vi.fn()) {
  const mutacion: Partial<ReturnType<typeof useAsignarAsesorEvaluacion>> = {
    mutate,
    isPending: false,
  };
  vi.mocked(useAsignarAsesorEvaluacion).mockReturnValue(
    mutacion as ReturnType<typeof useAsignarAsesorEvaluacion>,
  );
  return mutate;
}

function errorApi(errorCode: string, message = 'x') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function elegirAna(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('combobox', { name: 'Asesor' }));
  await user.click(await screen.findByRole('option', { name: /Ana Gómez/ }));
}

describe('AsignarAsesorEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsesores();
    mockMutacion();
  });

  it('muestra el título, la ayuda y deja "Asignar asesor" deshabilitado hasta elegir uno', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsignarAsesorEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getByText(/será reemplazado por el que elijas/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar asesor' })).toBeDisabled();

    // Act
    await elegirAna(user);

    // Assert
    expect(screen.getByRole('button', { name: 'Asignar asesor' })).toBeEnabled();
  });

  it('al enviar asigna el id elegido, avisa del éxito y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockMutacion(
      vi.fn((_id: string, opciones: { onSuccess: () => void }) => opciones.onSuccess()),
    );
    render(<AsignarAsesorEvaluacionPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);
    await elegirAna(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar asesor' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('a-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un 422 muestra el toast con el motivo, no cierra y conserva la selección', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockMutacion(
      vi.fn((_id: string, opciones: { onError: (e: unknown) => void }) =>
        opciones.onError(errorApi('EVALUACION_ASESOR_CON_EVALUACIONES')),
      ),
    );
    render(<AsignarAsesorEvaluacionPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);
    await elegirAna(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar asesor' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo asignar el asesor',
      expect.stringContaining('ya registró evaluaciones'),
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Asignar asesor' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ASESOR_NO_ENCONTRADO pinta además el mensaje junto al campo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(
      vi.fn((_id: string, opciones: { onError: (e: unknown) => void }) =>
        opciones.onError(errorApi('ASESOR_NO_ENCONTRADO')),
      ),
    );
    render(<AsignarAsesorEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);
    await elegirAna(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar asesor' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El asesor elegido ya no está vigente. Elige otro.',
    );
  });

  it('muestra el esqueleto mientras carga el catálogo y el aviso con el envío deshabilitado si falla', () => {
    // Arrange
    mockAsesores({ data: undefined, isLoading: true });
    const { rerender } = render(
      <AsignarAsesorEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />,
    );

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando asesores…');
    expect(screen.getByRole('button', { name: 'Asignar asesor' })).toBeDisabled();

    // Act
    mockAsesores({ data: undefined, isError: true });
    rerender(<AsignarAsesorEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Asesor' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar asesor' })).toBeDisabled();
  });
});
