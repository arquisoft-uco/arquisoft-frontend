import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { MENSAJES_VALIDACION } from '../../../../shared/validation';
import { useModificarObservacionItem } from '../../hooks/useModificarObservacionItem';
import EditarObservacionItemPanel from './EditarObservacionItemPanel';

vi.mock('../../hooks/useModificarObservacionItem', () => ({
  useModificarObservacionItem: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Resultado = ReturnType<typeof useModificarObservacionItem>;
type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

const OBSERVACION = {
  id: 'o-1',
  revisionItemId: 'r-1',
  observacion: 'Texto actual',
  estadoId: 'PENDIENTE',
  estadoNombre: 'Pendiente',
};

function mockHook(mutate = vi.fn()) {
  const resultado: Partial<Record<keyof Resultado, unknown>> = {
    mutate,
    reset: vi.fn(),
    isPending: false,
  };
  vi.mocked(useModificarObservacionItem).mockReturnValue(resultado as Resultado);
  return mutate;
}

function montar(onCerrar = vi.fn()) {
  render(
    <EditarObservacionItemPanel
      observacion={OBSERVACION}
      fichaPerfilId="f-1"
      nombreItem="Objetivo general"
      onCerrar={onCerrar}
    />,
  );
}

const guardar = () => screen.getByRole('button', { name: 'Guardar cambios' });
const campo = () => screen.getByRole('textbox', { name: 'Observación' });

describe('EditarObservacionItemPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el texto actual, limita a 200 y habilita guardar solo cuando cambia', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook();
    montar();

    // Assert
    expect(screen.getByRole('dialog', { name: 'Editar observación' })).toBeInTheDocument();
    expect(campo()).toHaveValue('Texto actual');
    expect(campo()).toHaveAttribute('maxlength', '200');
    expect(guardar()).toBeDisabled();

    // Act
    await user.type(campo(), ' editado');

    // Assert
    expect(guardar()).toBeEnabled();
  });

  it('vaciar el texto muestra el error y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockHook();
    montar();

    // Act
    await user.clear(campo());
    await user.click(guardar());

    // Assert
    expect(await screen.findAllByText(MENSAJES_VALIDACION.requerido)).not.toHaveLength(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('guardar con texto nuevo envía el request con el texto recortado, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockHook(vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.()));
    montar(onCerrar);

    // Act
    await user.clear(campo());
    await user.type(campo(), '  Texto nuevo  ');
    await user.click(guardar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { observacionItemId: 'o-1', observacion: 'Texto nuevo' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Observación actualizada', expect.any(String));
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
    await user.type(campo(), ' repetida');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo actualizar la observación', 'Ya existe.');
    expect(await screen.findAllByText('Ya existe.')).not.toHaveLength(0);
    expect(campo()).toHaveValue('Texto actual repetida');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it.each([
    ['REVISION_ITEM_CERRADA', 'La revisión está cerrada y ya no admite cambios.'],
    ['OBSERVACION_ITEM_NO_ENCONTRADA', 'La observación ya no existe.'],
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
    await user.type(campo(), ' más');
    await user.click(guardar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo actualizar la observación', motivo);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
