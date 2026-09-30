import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AgregarItemForm from './AgregarItemForm';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import type { TipoItem } from '../../models/fichas-perfil';

vi.mock('../../hooks/useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useItemsMiFichaMock = vi.mocked(useItemsMiFicha);

type Resultado = ReturnType<typeof useItemsMiFicha>;
type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

const TIPOS: TipoItem[] = [
  { id: 'OBJETIVO_GENERAL', nombre: 'Objetivo General', descripcion: '' },
  { id: 'JUSTIFICACION', nombre: 'Justificación', descripcion: '' },
];

function errorApi(status: number, data: Record<string, unknown>) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}

function mockHook(mutate = vi.fn(), parcial: Partial<Resultado> = {}) {
  const reset = vi.fn();
  useItemsMiFichaMock.mockReturnValue({
    fichaId: 'f-1',
    items: [],
    tiposItem: TIPOS,
    isLoading: false,
    isError: false,
    agregar: { mutate, reset, isPending: false },
    ...parcial,
  } as Resultado);
  return { mutate, reset };
}

async function completar(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/tipo de ítem/i), 'OBJETIVO_GENERAL');
  await user.type(screen.getByLabelText(/contenido/i), 'Medir el impacto');
}

describe('AgregarItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía los datos válidos, avisa del éxito y se cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate } = mockHook(
      vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.()),
    );
    render(<AgregarItemForm onCerrar={onCerrar} />);

    // Act
    await completar(user);
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { fichaPerfilId: 'f-1', tipoItemId: 'OBJETIVO_GENERAL', contenido: 'Medir el impacto' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem agregado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el envío y pinta el error con contenido en blanco', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<AgregarItemForm onCerrar={vi.fn()} />);
    const contenido = screen.getByLabelText(/contenido/i);

    // Act
    await user.type(contenido, 'a');
    await user.clear(contenido);

    // Assert
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('deshabilita el envío y pinta el error al dejar el tipo sin elegir', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<AgregarItemForm onCerrar={vi.fn()} />);
    const tipo = screen.getByLabelText(/tipo de ítem/i);
    await user.type(screen.getByLabelText(/contenido/i), 'Medir el impacto');

    // Act
    await user.selectOptions(tipo, 'OBJETIVO_GENERAL');
    await user.selectOptions(tipo, '');

    // Assert
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante ITEM_TIPO_DUPLICADO muestra toast y mensaje bajo el select sin cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, { message: 'Ya existe un ítem de ese tipo.', errorCode: 'ITEM_TIPO_DUPLICADO' }),
        ),
      ),
    );
    render(<AgregarItemForm onCerrar={onCerrar} />);

    // Act
    await completar(user);
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar', 'Ya existe un ítem de ese tipo.');
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un ítem de ese tipo.');
    expect(screen.getByLabelText(/contenido/i)).toHaveValue('Medir el impacto');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante estado terminal muestra el mensaje del backend y deja el formulario abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, {
            message: 'La ficha está en estado terminal.',
            errorCode: 'ESTADO_FICHA_PERFIL_ESTADO_TERMINAL',
          }),
        ),
      ),
    );
    render(<AgregarItemForm onCerrar={onCerrar} />);

    // Act
    await completar(user);
    await user.click(screen.getByRole('button', { name: 'Agregar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar', 'La ficha está en estado terminal.');
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeEnabled();
  });

  it('muestra AvisoNoDisponible y deshabilita el envío sin tipos en el catálogo', () => {
    // Arrange
    mockHook(vi.fn(), { tiposItem: [] });

    // Act
    render(<AgregarItemForm onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/tipos de ítem/i);
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
  });

  it('al cancelar resetea la mutación y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { reset } = mockHook();
    render(<AgregarItemForm onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
