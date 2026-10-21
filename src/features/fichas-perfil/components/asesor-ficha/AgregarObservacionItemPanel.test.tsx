import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { MENSAJES_VALIDACION } from '../../../../shared/validation';
import { useAgregarObservacionItem } from '../../hooks/useAgregarObservacionItem';
import AgregarObservacionItemPanel from './AgregarObservacionItemPanel';

vi.mock('../../hooks/useAgregarObservacionItem', () => ({ useAgregarObservacionItem: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Resultado = ReturnType<typeof useAgregarObservacionItem>;
type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

function mockHook(mutate = vi.fn()) {
  const resultado: Partial<Record<keyof Resultado, unknown>> = {
    mutate,
    reset: vi.fn(),
    isPending: false,
  };
  vi.mocked(useAgregarObservacionItem).mockReturnValue(resultado as Resultado);
  return mutate;
}

function montar(onCerrar = vi.fn()) {
  render(
    <AgregarObservacionItemPanel
      revisionItemId="r-1"
      fichaPerfilId="f-1"
      nombreItem="Objetivo general"
      onCerrar={onCerrar}
    />,
  );
}

const enviar = () => screen.getByRole('button', { name: 'Agregar observación' });
const campo = () => screen.getByRole('textbox', { name: 'Observación' });

describe('AgregarObservacionItemPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enviar vacío muestra el error y no llama a la mutación; el campo limita a 200', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockHook();
    montar();

    // Act
    await user.click(enviar());

    // Assert
    expect(screen.getByRole('dialog', { name: 'Agregar observación' })).toBeInTheDocument();
    expect(await screen.findAllByText(MENSAJES_VALIDACION.requerido)).not.toHaveLength(0);
    expect(mutate).not.toHaveBeenCalled();
    expect(campo()).toHaveAttribute('maxlength', '200');
  });

  it('enviar con texto llama a la mutación, avisa del éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockHook(vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.()));
    montar(onCerrar);

    // Act
    await user.type(campo(), 'Falta precisión');
    await user.click(enviar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { revisionItemId: 'r-1', observacion: 'Falta precisión' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Observación agregada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante OBSERVACION_ITEM_DUPLICADA da toast y pinta el mensaje junto al campo sin cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, { errorCode: 'OBSERVACION_ITEM_DUPLICADA', message: 'Ya existe.' }),
        ),
      ),
    );
    montar(onCerrar);

    // Act
    await user.type(campo(), 'Repetida');
    await user.click(enviar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo agregar la observación', 'Ya existe.');
    expect(await screen.findAllByText('Ya existe.')).not.toHaveLength(0);
    expect(campo()).toHaveValue('Repetida');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('ante REVISION_ITEM_CERRADA avisa con el motivo y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(errorApi(422, { errorCode: 'REVISION_ITEM_CERRADA', message: 'backend' })),
      ),
    );
    montar(onCerrar);

    // Act
    await user.type(campo(), 'Texto');
    await user.click(enviar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo agregar la observación',
      'La revisión está cerrada y ya no admite cambios.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['REVISION_ITEM_NO_ENCONTRADA', 'La revisión ya no existe.'],
    ['FICHA_NO_PERTENECE_ASESOR', 'Esta ficha no está asignada a ti.'],
  ])('ante %s avisa con el motivo y cierra el panel', async (errorCode, motivo) => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(errorApi(422, { errorCode, message: 'backend' })),
      ),
    );
    montar(onCerrar);

    // Act
    await user.type(campo(), 'Texto');
    await user.click(enviar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo agregar la observación', motivo);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cancelar con texto escrito pide confirmar el descarte', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook();
    montar(onCerrar);

    // Act
    await user.type(campo(), 'Texto');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText('¿Descartar los cambios?')).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
