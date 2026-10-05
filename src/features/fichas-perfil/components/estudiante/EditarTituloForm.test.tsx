import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EditarTituloForm from './EditarTituloForm';
import { useMiFichaPerfil } from '../../hooks/useMiFichaPerfil';
import { LIMITES } from '../../../../shared/validation';

vi.mock('../../hooks/useMiFichaPerfil', () => ({ useMiFichaPerfil: vi.fn() }));

type Resultado = ReturnType<typeof useMiFichaPerfil>;
type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

function errorApi(status: number, data: Record<string, unknown>) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}

function mockHook(mutate = vi.fn()) {
  const reset = vi.fn();
  const resultado: Partial<Record<keyof Resultado, unknown>> = {
    modificarTitulo: { mutate, reset, isPending: false },
  };
  vi.mocked(useMiFichaPerfil).mockReturnValue(resultado as Resultado);
  return { mutate, reset };
}

const guardar = () => screen.getByRole('button', { name: 'Guardar título' });
const campo = () => screen.getByRole('textbox', { name: 'Título del proyecto' });

describe('EditarTituloForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el título actual, limita la longitud y no deja guardar sin cambios', () => {
    // Arrange
    mockHook();

    // Act
    render(<EditarTituloForm tituloActual="Sistema de monitoreo" onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Editar título del proyecto' })).toBeInTheDocument();
    expect(campo()).toHaveValue('Sistema de monitoreo');
    expect(campo()).toHaveAttribute('maxLength', String(LIMITES.TITULO_PROYECTO_MAX));
    expect(guardar()).toBeDisabled();
  });

  it('guarda el nuevo título y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate } = mockHook(vi.fn((_t: string, opts: Opciones) => opts.onSuccess?.()));
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={onCerrar} />);

    // Act
    await user.clear(campo());
    await user.type(campo(), 'Sistema nuevo');
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith('Sistema nuevo', expect.any(Object));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con el título vacío o en blanco pinta el error, muestra el resumen y no envía', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={vi.fn()} />);

    // Act
    await user.clear(campo());
    await user.type(campo(), '   ');
    await user.tab();
    await user.click(guardar());

    // Assert
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(screen.getByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
    expect(campo()).toHaveFocus();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('FICHA_TITULO_DUPLICADO se muestra junto al campo y el panel sigue abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_t: string, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, { errorCode: 'FICHA_TITULO_DUPLICADO', message: 'Ese título ya existe.' }),
        ),
      ),
    );
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={onCerrar} />);

    // Act
    await user.type(campo(), ' 2');
    await user.click(guardar());

    // Assert
    expect(await screen.findAllByText('Ese título ya existe.')).not.toHaveLength(0);
    expect(campo()).toHaveValue('Sistema 2');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('un fieldError del backend se pinta junto al campo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook(
      vi.fn((_t: string, opts: Opciones) =>
        opts.onError?.(
          errorApi(400, {
            fieldErrors: [{ field: 'tituloProyecto', message: 'Título inválido.' }],
          }),
        ),
      ),
    );
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={vi.fn()} />);

    // Act
    await user.type(campo(), ' 2');
    await user.click(guardar());

    // Assert
    expect(await screen.findAllByText('Título inválido.')).not.toHaveLength(0);
  });

  it('cerrar sin cambios reinicia la mutación; con cambios pide confirmar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { reset } = mockHook();
    render(<EditarTituloForm tituloActual="Sistema" onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);

    // Act
    await user.type(campo(), '!');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText('¿Descartar los cambios?')).toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
