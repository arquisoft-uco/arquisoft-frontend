import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import ItemsMiFichaPanel from './ItemsMiFichaPanel';

vi.mock('../../hooks/useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

function errorApi(status: number, data: Record<string, unknown> = {}) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}

const ITEM = {
  id: 'i-1',
  fichaPerfilId: 'f-1',
  tipoItem: { id: 't-1', nombre: 'Objetivo' },
  contenido: 'Medir consumo',
};

const mutacion = { mutate: vi.fn(), reset: vi.fn(), isPending: false } as never;

function conEstado(parcial: Partial<ReturnType<typeof useItemsMiFicha>>) {
  vi.mocked(useItemsMiFicha).mockReturnValue({
    fichaId: 'f-1',
    items: [],
    tiposItem: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    agregar: mutacion,
    modificar: mutacion,
    remover: mutacion,
    ...parcial,
  });
}

describe('ItemsMiFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga', () => {
    // Arrange
    conEstado({ isLoading: true });

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems de la ficha...');
    expect(screen.queryByText(/aún no tiene ítems/)).not.toBeInTheDocument();
  });

  it('lista cada ítem con el nombre de su tipo y su contenido', () => {
    // Arrange
    conEstado({
      items: [
        {
          id: 'i-1',
          fichaPerfilId: 'f-1',
          tipoItem: { id: 't-1', nombre: 'Objetivo' },
          contenido: 'Medir consumo',
        },
      ],
    });

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
    expect(screen.getByText('Medir consumo')).toBeInTheDocument();
  });

  it('invita a agregar el primer ítem cuando la ficha no tiene ninguno', () => {
    // Arrange
    conEstado({});

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByText(/Tu ficha aún no tiene ítems/)).toBeInTheDocument();
  });

  it('muestra una alerta accionable cuando falla la carga y no el vacío', () => {
    // Arrange
    conEstado({ isError: true });

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los ítems de tu ficha',
    );
    expect(screen.queryByText(/aún no tiene ítems/)).not.toBeInTheDocument();
  });

  it('vuelve a consultar los ítems al pulsar «Reintentar» tras un error de carga', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conEstado({ isError: true, refetch });
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('abre la edición con el contenido actual y al cancelar vuelve al texto', async () => {
    // Arrange
    const user = userEvent.setup();
    conEstado({
      items: [
        {
          id: 'i-1',
          fichaPerfilId: 'f-1',
          tipoItem: { id: 't-1', nombre: 'Objetivo' },
          contenido: 'Medir consumo',
        },
      ],
    });
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Editar ítem Objetivo' }));

    // Assert
    expect(screen.getByRole('textbox', { name: /contenido del ítem objetivo/i })).toHaveValue(
      'Medir consumo',
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Medir consumo')).toBeInTheDocument();
  });

  describe('eliminar', () => {
    function conRemover(mutate: ReturnType<typeof vi.fn>) {
      conEstado({ items: [ITEM], remover: { mutate, reset: vi.fn(), isPending: false } as never });
    }

    it('cancelar el diálogo no elimina el ítem', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = vi.fn();
      conRemover(mutate);
      render(<ItemsMiFichaPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar ítem Objetivo' }));
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      // Assert
      expect(mutate).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('confirmar elimina el ítem, avisa del éxito y cierra el diálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = vi.fn((_id: string, opts: Opciones) => opts.onSuccess?.());
      conRemover(mutate);
      render(<ItemsMiFichaPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar ítem Objetivo' }));
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      expect(mutate).toHaveBeenCalledWith('i-1', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Ítem eliminado', expect.any(String));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('ante ITEM_CON_REVISIONES muestra el mensaje explicativo y cierra el diálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = vi.fn((_id: string, opts: Opciones) =>
        opts.onError?.(errorApi(422, { errorCode: 'ITEM_CON_REVISIONES', message: 'backend' })),
      );
      conRemover(mutate);
      render(<ItemsMiFichaPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar ítem Objetivo' }));
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      expect(toast.error).toHaveBeenCalledWith(
        'Error al eliminar',
        'El ítem ya fue revisado por tu asesor y no puede eliminarse.',
      );
      expect(toast.success).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Medir consumo')).toBeInTheDocument();
    });

    it('ante un 400 avisa que el ítem ya no existe y ante otro error usa el mensaje del backend', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = vi
        .fn()
        .mockImplementationOnce((_id: string, opts: Opciones) => opts.onError?.(errorApi(400)))
        .mockImplementationOnce((_id: string, opts: Opciones) =>
          opts.onError?.(errorApi(422, { message: 'Ficha en estado terminal.' })),
        );
      conRemover(mutate);
      render(<ItemsMiFichaPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar ítem Objetivo' }));
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      expect(toast.error).toHaveBeenLastCalledWith('Error al eliminar', 'El ítem ya no existe.');

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar ítem Objetivo' }));
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      expect(toast.error).toHaveBeenLastCalledWith(
        'Error al eliminar',
        'Ficha en estado terminal.',
      );
    });
  });
});
