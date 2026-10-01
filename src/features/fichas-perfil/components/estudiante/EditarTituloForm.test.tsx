import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EditarTituloForm from './EditarTituloForm';
import { useMiFichaPerfil } from '../../hooks/useMiFichaPerfil';
import { LIMITES, MENSAJES_VALIDACION } from '../../../../shared/validation';

vi.mock('../../hooks/useMiFichaPerfil', () => ({ useMiFichaPerfil: vi.fn() }));

type Resultado = ReturnType<typeof useMiFichaPerfil>;
type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

function errorApi(status: number, data: Record<string, unknown>) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}

function mockHook(mutate = vi.fn()) {
  const reset = vi.fn();
  vi.mocked(useMiFichaPerfil).mockReturnValue({
    modificarTitulo: { mutate, reset, isPending: false },
  } as unknown as Resultado);
  return { mutate, reset };
}

describe('EditarTituloForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el título actual y deshabilita Guardar mientras no haya cambios', () => {
    // Arrange
    mockHook();

    // Act
    render(<EditarTituloForm tituloActual="Sistema de monitoreo" onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('textbox', { name: /nuevo título del proyecto/i })).toHaveValue(
      'Sistema de monitoreo',
    );
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('con título vacío o solo espacios deshabilita Guardar, pinta el error y limita la longitud', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={vi.fn()} />);
    const campo = screen.getByRole('textbox', { name: /nuevo título/i });

    // Act
    await user.clear(campo);
    const errorVacio = await screen.findByRole('alert');
    const guardarVacio = screen.getByRole('button', { name: 'Guardar' });
    await user.type(campo, '   ');

    // Assert
    expect(errorVacio).toHaveTextContent(MENSAJES_VALIDACION.requerido);
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(guardarVacio).toBeDisabled();
    expect(campo).toHaveAttribute('maxlength', String(LIMITES.TITULO_PROYECTO_MAX));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía el título sin espacios sobrantes y se cierra al tener éxito', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate } = mockHook(vi.fn((_t: string, opts: Opciones) => opts.onSuccess?.()));
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={onCerrar} />);
    const campo = screen.getByRole('textbox', { name: /nuevo título/i });

    // Act
    await user.clear(campo);
    await user.type(campo, '  Nuevo título  ');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('Nuevo título', expect.any(Object));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante FICHA_TITULO_DUPLICADO pinta el mensaje junto al campo y no se cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_t: string, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, { message: 'Ya existe una ficha con ese título.', errorCode: 'FICHA_TITULO_DUPLICADO' }),
        ),
      ),
    );
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={onCerrar} />);
    const campo = screen.getByRole('textbox', { name: /nuevo título/i });

    // Act
    await user.type(campo, ' bis');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una ficha con ese título.');
    expect(campo).toHaveValue('Sistema bis');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante un fieldError de tituloProyecto lo pinta en el campo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook(
      vi.fn((_t: string, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, {
            message: 'Datos inválidos.',
            fieldErrors: [{ field: 'tituloProyecto', message: 'Título no permitido' }],
          }),
        ),
      ),
    );
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={vi.fn()} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: /nuevo título/i }), ' x');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Título no permitido');
  });

  it('al cancelar resetea la mutación y cierra sin enviar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate, reset } = mockHook();
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});
