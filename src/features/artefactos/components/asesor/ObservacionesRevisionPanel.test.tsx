import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import { useEliminarObservacion } from '../../hooks/useEliminarObservacion';
import { toast } from '../../../../shared/hooks/useToast';
import ObservacionesRevisionPanel from './ObservacionesRevisionPanel';

vi.mock('../../hooks/useObservacionesRevision', () => ({
  useObservacionesRevision: vi.fn(),
}));

vi.mock('../../hooks/useEliminarObservacion', () => ({ useEliminarObservacion: vi.fn() }));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const hook = vi.mocked(useObservacionesRevision);
const eliminarHook = vi.mocked(useEliminarObservacion);
const mutate = vi.fn();

type ResultadoEliminar = ReturnType<typeof useEliminarObservacion>;

function estadoEliminar(): ResultadoEliminar {
  const base: Partial<ResultadoEliminar> = { mutate, isPending: false, variables: undefined };
  return Object.assign(base) as ResultadoEliminar;
}

type Resultado = ReturnType<typeof useObservacionesRevision>;

function estado(parcial: Partial<Resultado>): Resultado {
  const base: Partial<Resultado> = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  return Object.assign(base, parcial) as Resultado;
}

const nueva: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-1',
  descripcion: 'Falta el diagrama de despliegue',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
};

const solucionada: ObservacionRevision = {
  ...nueva,
  id: 'o-2',
  descripcion: 'Corregir la portada',
  estadoId: 'SOLUCIONADA',
  estadoNombre: 'Solucionada',
};

describe('ObservacionesRevisionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eliminarHook.mockReturnValue(estadoEliminar());
  });

  async function pedirEliminar(user: ReturnType<typeof userEvent.setup>) {
    render(<ObservacionesRevisionPanel revisionAsesorId="r-1" onCerrar={vi.fn()} />);
    const menus = screen.getAllByRole('button', { name: 'Acciones de la observación' });
    await user.click(menus[1]);
    await user.click(await screen.findByRole('menuitem', { name: 'Eliminar observación' }));
  }

  it('confirma y elimina la observación de la fila elegida con aviso de éxito', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    mutate.mockImplementation((_id: string, opciones: { onSuccess: () => void }) =>
      opciones.onSuccess(),
    );
    const user = userEvent.setup();

    // Act
    await pedirEliminar(user);
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar observación' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toBe('o-2');
    expect(toast.success).toHaveBeenCalledWith('Observación eliminada');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('al cancelar el diálogo no elimina nada', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    const user = userEvent.setup();

    // Act
    await pedirEliminar(user);
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('si el servidor rechaza la eliminación avisa con el motivo y cierra el diálogo', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    mutate.mockImplementation((_id: string, opciones: { onError: (e: unknown) => void }) =>
      opciones.onError(new Error('422')),
    );
    const user = userEvent.setup();

    // Act
    await pedirEliminar(user);
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la observación',
      expect.any(String),
    );
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('muestra el estado de carga accesible mientras consulta', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    render(<ObservacionesRevisionPanel revisionAsesorId="r-1" onCerrar={vi.fn()} />);

    // Assert
    expect(hook).toHaveBeenCalledWith('r-1');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista una tarjeta por observación con su descripción y el nombre de su estado', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));

    // Act
    render(<ObservacionesRevisionPanel revisionAsesorId="r-1" onCerrar={vi.fn()} />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Observaciones de la revisión' });
    const items = within(lista).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Falta el diagrama de despliegue')).toBeInTheDocument();
    expect(within(items[0]).getByText('Nueva')).toBeInTheDocument();
    expect(within(items[1]).getByText('Corregir la portada')).toBeInTheDocument();
    expect(within(items[1]).getByText('Solucionada')).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío y no un error cuando la revisión no tiene observaciones', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    render(<ObservacionesRevisionPanel revisionAsesorId="r-1" onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Esta revisión aún no tiene observaciones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error y reintenta la consulta al pulsar Reintentar', async () => {
    // Arrange
    const refetch = vi.fn();
    hook.mockReturnValue(estado({ isError: true, error: new Error('Sin conexión'), refetch }));
    const user = userEvent.setup();

    // Act
    render(<ObservacionesRevisionPanel revisionAsesorId="r-1" onCerrar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No pudimos cargar las observaciones')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('llama a onCerrar al pulsar Cerrar', async () => {
    // Arrange
    const onCerrar = vi.fn();
    hook.mockReturnValue(estado({ data: [] }));
    const user = userEvent.setup();

    // Act
    render(<ObservacionesRevisionPanel revisionAsesorId="r-1" onCerrar={onCerrar} />);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  });
});
