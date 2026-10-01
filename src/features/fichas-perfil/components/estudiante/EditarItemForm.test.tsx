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
  tipoItem: { id: 't-1', nombre: 'Objetivo' },
  contenido: 'Medir consumo',
};

function errorApi(status: number, data: Record<string, unknown>) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}

function mockHook(mutate = vi.fn()) {
  const reset = vi.fn();
  vi.mocked(useItemsMiFicha).mockReturnValue({
    modificar: { mutate, reset, isPending: false },
  } as unknown as Resultado);
  return { mutate, reset };
}

describe('EditarItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el contenido actual y deshabilita Guardar mientras no haya cambios', () => {
    // Arrange
    mockHook();

    // Act
    render(<EditarItemForm item={ITEM} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('textbox', { name: /contenido del ítem objetivo/i })).toHaveValue(
      'Medir consumo',
    );
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('deshabilita Guardar y pinta el error con contenido vacío o solo espacios', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<EditarItemForm item={ITEM} onCerrar={vi.fn()} />);
    const campo = screen.getByRole('textbox', { name: /contenido del ítem/i });

    // Act
    await user.clear(campo);
    const errorVacio = await screen.findByRole('alert');
    await user.type(campo, '   ');

    // Assert
    expect(errorVacio).toHaveTextContent('Este campo es requerido');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía el contenido editado, avisa del éxito y se cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate } = mockHook(vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.()));
    render(<EditarItemForm item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: /contenido del ítem/i }), ' y costo');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { itemId: 'i-1', contenido: 'Medir consumo y costo' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem actualizado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un 422 con fieldError muestra toast, pinta el campo y conserva el texto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, {
            message: 'Contenido inválido.',
            fieldErrors: [{ field: 'contenido', message: 'Contenido duplicado' }],
          }),
        ),
      ),
    );
    render(<EditarItemForm item={ITEM} onCerrar={onCerrar} />);
    const campo = screen.getByRole('textbox', { name: /contenido del ítem/i });

    // Act
    await user.type(campo, ' nuevo');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al modificar', 'Contenido inválido.');
    expect(await screen.findByRole('alert')).toHaveTextContent('Contenido duplicado');
    expect(campo).toHaveValue('Medir consumo nuevo');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('al cancelar resetea la mutación y cierra sin enviar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate, reset } = mockHook();
    render(<EditarItemForm item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});
