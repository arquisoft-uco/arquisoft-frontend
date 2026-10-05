import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EditarItemForm from './EditarItemForm';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import type { Item } from '../../models/fichas-perfil';

vi.mock('../../hooks/useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Resultado = ReturnType<typeof useItemsMiFicha>;
type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

const ITEM: Item = {
  id: 'i-1',
  fichaPerfilId: 'f-1',
  tipoItem: { id: 't-1', nombre: 'Objetivo General' },
  contenido: 'Medir consumo',
};

function errorApi(status: number, data: Record<string, unknown>) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}

function mockHook(mutate = vi.fn()) {
  const reset = vi.fn();
  const resultado: Partial<Record<keyof Resultado, unknown>> = {
    modificar: { mutate, reset, isPending: false },
  };
  vi.mocked(useItemsMiFicha).mockReturnValue(resultado as Resultado);
  return { mutate, reset };
}

const guardar = () => screen.getByRole('button', { name: 'Guardar cambios' });

describe('EditarItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre con el contenido del ítem y no deja guardar mientras no haya cambios', () => {
    // Arrange
    mockHook();

    // Act
    render(<EditarItemForm item={ITEM} onCerrar={vi.fn()} />);

    // Assert
    expect(
      screen.getByRole('dialog', { name: 'Editar ítem Objetivo General' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Contenido' })).toHaveValue('Medir consumo');
    expect(guardar()).toBeDisabled();
  });

  it('guarda el nuevo contenido, avisa del éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate } = mockHook(vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.()));
    render(<EditarItemForm item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Contenido' }), ' mensual');
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { itemId: 'i-1', contenido: 'Medir consumo mensual' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem actualizado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con el contenido vacío pinta el error al salir del campo, sin apagar el botón, y no envía', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<EditarItemForm item={ITEM} onCerrar={vi.fn()} />);

    // Act
    await user.clear(screen.getByRole('textbox', { name: 'Contenido' }));
    await user.tab();
    await user.click(guardar());

    // Assert
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(screen.getByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Contenido' })).toHaveFocus();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante un error del backend da toast, pinta el campo y deja el panel abierto con los datos', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(400, {
            message: 'Datos inválidos.',
            fieldErrors: [{ field: 'contenido', message: 'Contenido no permitido.' }],
          }),
        ),
      ),
    );
    render(<EditarItemForm item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Contenido' }), ' x');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al modificar', 'Datos inválidos.');
    expect(await screen.findAllByText('Contenido no permitido.')).not.toHaveLength(0);
    expect(screen.getByRole('textbox', { name: 'Contenido' })).toHaveValue('Medir consumo x');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('cerrar sin cambios reinicia la mutación y cierra; con cambios pide confirmar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { reset } = mockHook();
    render(<EditarItemForm item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Contenido' }), '!');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText('¿Descartar los cambios?')).toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
