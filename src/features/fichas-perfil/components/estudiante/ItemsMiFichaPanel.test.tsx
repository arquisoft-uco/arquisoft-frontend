import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import ItemsMiFichaPanel from './ItemsMiFichaPanel';

vi.mock('../../hooks/useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));
vi.mock('../AyudaTiposItem', () => ({
  default: () => <button type="button">Ayuda de tipos</button>,
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
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

const TIPOS = [
  { id: 't-1', nombre: 'Objetivo', descripcion: '' },
  { id: 't-2', nombre: 'Justificación', descripcion: '' },
];

const mutacion = { mutate: vi.fn(), reset: vi.fn(), isPending: false };

type Resultado = ReturnType<typeof useItemsMiFicha>;

function conEstado(parcial: Partial<Record<keyof Resultado, unknown>>) {
  vi.mocked(useItemsMiFicha).mockReturnValue({
    fichaId: 'f-1',
    items: [],
    tiposItem: TIPOS,
    itemsCargados: true,
    isLoading: false,
    isError: false,
    cargandoTipos: false,
    errorTipos: false,
    refetch: vi.fn(),
    agregar: mutacion,
    modificar: mutacion,
    remover: mutacion,
    ...parcial,
  } as Resultado);
}

describe('ItemsMiFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra la carga sin vacío mientras no hay datos, aunque la consulta esté pausada', () => {
    // Arrange
    conEstado({ isLoading: true, itemsCargados: false });
    const { unmount } = render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems…');
    expect(screen.queryByText(/aún no tiene ítems/)).not.toBeInTheDocument();
    unmount();

    // Arrange: consulta pausada, sin carga ni error ni datos
    conEstado({ isLoading: false, itemsCargados: false });
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems…');
    expect(screen.queryByText(/aún no tiene ítems/)).not.toBeInTheDocument();
  });

  it('lista cada ítem con el nombre de su tipo y su contenido', () => {
    // Arrange
    conEstado({ items: [ITEM] });

    // Act
    render(<ItemsMiFichaPanel />);

    // Assert
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
    expect(screen.getByText('Medir consumo')).toBeInTheDocument();
  });

  it('invita a agregar el primer ítem y la acción del vacío abre el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    conEstado({});
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Agregar ítem' })[1]);

    // Assert
    expect(screen.getByText('Tu ficha aún no tiene ítems')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Agregar ítem' })).toBeInTheDocument();
  });

  it('muestra una alerta accionable y «Reintentar» vuelve a consultar, sin vacío', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conEstado({ isError: true, itemsCargados: false, refetch });
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los ítems');
    expect(screen.queryByText(/aún no tiene ítems/)).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('«Agregar ítem» abre el panel con la lista detrás y al cerrarlo desaparece', async () => {
    // Arrange
    const user = userEvent.setup();
    conEstado({ items: [ITEM] });
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Agregar ítem' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Agregar ítem' })).toBeInTheDocument();
    expect(screen.getByText('Medir consumo')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('agregar un ítem avisa del éxito y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.());
    conEstado({
      items: [ITEM],
      agregar: { mutate, reset: vi.fn(), isPending: false },
    });
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Agregar ítem' }));
    await user.selectOptions(screen.getByLabelText('Tipo de ítem'), 't-2');
    await user.type(screen.getByLabelText('Contenido'), 'Por qué hacerlo');
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Agregar ítem' }),
    );

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { fichaPerfilId: 'f-1', tipoItemId: 't-2', contenido: 'Por qué hacerlo' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem agregado', expect.any(String));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ITEM_TIPO_DUPLICADO se muestra junto al campo, con toast y el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_req: unknown, opts: Opciones) =>
      opts.onError?.(
        errorApi(422, {
          errorCode: 'ITEM_TIPO_DUPLICADO',
          message: 'Ya existe un ítem de ese tipo.',
        }),
      ),
    );
    conEstado({ agregar: { mutate, reset: vi.fn(), isPending: false } });
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Agregar ítem' })[0]);
    await user.selectOptions(screen.getByLabelText('Tipo de ítem'), 't-1');
    await user.type(screen.getByLabelText('Contenido'), 'Texto');
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Agregar ítem' }),
    );

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar', 'Ya existe un ítem de ese tipo.');
    expect(screen.getByRole('dialog', { name: 'Agregar ítem' })).toBeInTheDocument();
    expect(screen.getByLabelText('Contenido')).toHaveValue('Texto');
    expect(screen.getAllByText('Ya existe un ítem de ese tipo.').length).toBeGreaterThan(0);
  });

  it('«Editar ítem» abre el panel con el contenido y guarda los cambios', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.());
    conEstado({
      items: [ITEM],
      modificar: { mutate, reset: vi.fn(), isPending: false },
    });
    render(<ItemsMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Editar ítem Objetivo' }));
    const campo = screen.getByRole('textbox', { name: 'Contenido' });
    await user.type(campo, ' mensual');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { itemId: 'i-1', contenido: 'Medir consumo mensual' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem actualizado', expect.any(String));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('eliminar', () => {
    function conRemover(mutate: ReturnType<typeof vi.fn>) {
      conEstado({
        items: [ITEM],
        remover: { mutate, reset: vi.fn(), isPending: false },
      });
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
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('confirmar elimina el ítem, avisa del éxito y cierra el diálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = vi.fn((_id: string, opts: Opciones) => opts.onSuccess?.());
      conRemover(mutate);
      render(<ItemsMiFichaPanel />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar ítem Objetivo' }));
      await user.click(screen.getByRole('button', { name: 'Eliminar ítem' }));

      // Assert
      expect(screen.queryByText('No se puede deshacer.')).not.toBeInTheDocument();
      expect(mutate).toHaveBeenCalledWith('i-1', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Ítem eliminado', expect.any(String));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('ante ITEM_CON_REVISIONES, un 400 u otro error muestra el mensaje que corresponde', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = vi
        .fn()
        .mockImplementationOnce((_id: string, opts: Opciones) =>
          opts.onError?.(errorApi(422, { errorCode: 'ITEM_CON_REVISIONES', message: 'backend' })),
        )
        .mockImplementationOnce((_id: string, opts: Opciones) => opts.onError?.(errorApi(400)))
        .mockImplementationOnce((_id: string, opts: Opciones) =>
          opts.onError?.(errorApi(422, { message: 'Ficha en estado terminal.' })),
        );
      conRemover(mutate);
      render(<ItemsMiFichaPanel />);
      const mensajes: unknown[] = [];

      // Act
      for (let i = 0; i < 3; i += 1) {
        await user.click(screen.getByRole('button', { name: 'Eliminar ítem Objetivo' }));
        await user.click(screen.getByRole('button', { name: 'Eliminar ítem' }));
        mensajes.push(vi.mocked(toast.error).mock.lastCall?.[1]);
      }

      // Assert
      expect(mensajes).toEqual([
        'El ítem ya fue revisado por tu asesor y no puede eliminarse.',
        'El ítem ya no existe.',
        'Ficha en estado terminal.',
      ]);
      expect(toast.success).not.toHaveBeenCalled();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByText('Medir consumo')).toBeInTheDocument();
    });
  });
});
