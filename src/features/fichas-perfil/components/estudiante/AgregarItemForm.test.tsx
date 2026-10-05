import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AgregarItemForm from './AgregarItemForm';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import { LIMITES } from '../../../../shared/validation';
import type { Item, TipoItem } from '../../models/fichas-perfil';
import { errorApi } from '../../../../test-utils/errores-api';

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

const ITEM_USADO: Item = {
  id: 'i-1',
  fichaPerfilId: 'f-1',
  tipoItem: { id: TIPOS[0].id, nombre: TIPOS[0].nombre },
  contenido: 'Ya existe',
};

function mockHook(mutate = vi.fn(), parcial: Partial<Resultado> = {}) {
  const reset = vi.fn();
  useItemsMiFichaMock.mockReturnValue({
    fichaId: 'f-1',
    items: [],
    tiposItem: TIPOS,
    cargandoTipos: false,
    errorTipos: false,
    agregar: { mutate, reset, isPending: false },
    ...parcial,
  } as Resultado);
  return { mutate, reset };
}

async function completar(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('Tipo de ítem'), 'OBJETIVO_GENERAL');
  await user.type(screen.getByLabelText('Contenido'), 'Medir el impacto');
}

const enviar = () => screen.getByRole('button', { name: 'Agregar ítem' });

describe('AgregarItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía los datos válidos, avisa del éxito y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { mutate, reset } = mockHook(
      vi.fn((_req: unknown, opts: Opciones) => opts.onSuccess?.()),
    );
    render(<AgregarItemForm onCerrar={onCerrar} />);

    // Act
    await completar(user);
    await user.click(enviar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { fichaPerfilId: 'f-1', tipoItemId: 'OBJETIVO_GENERAL', contenido: 'Medir el impacto' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem agregado', expect.any(String));
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('pinta el error al salir del campo sin apagar el botón y actualiza el contador', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<AgregarItemForm onCerrar={vi.fn()} />);
    const contenido = screen.getByLabelText('Contenido');

    // Act
    await user.type(contenido, 'abc');
    const contador = screen.getByText(`3/${LIMITES.ITEM_CONTENIDO_MAX}`, { exact: false });
    await user.clear(contenido);
    await user.tab();

    // Assert
    expect(contador).toBeInTheDocument();
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(enviar()).toBeEnabled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('un envío inválido muestra el resumen de errores y lleva el foco al primer campo con error', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = mockHook();
    render(<AgregarItemForm onCerrar={vi.fn()} />);

    // Act
    await user.click(enviar());

    // Assert
    expect(await screen.findByText('Revisa 2 campos antes de continuar')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de ítem')).toHaveFocus();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ofrece primero los tipos libres y deshabilita los ya agregados', () => {
    // Arrange
    mockHook(vi.fn(), { items: [ITEM_USADO] });

    // Act
    render(<AgregarItemForm onCerrar={vi.fn()} />);

    // Assert
    const opciones = screen.getAllByRole('option').map((o) => o.textContent);
    expect(opciones).toEqual([
      'Selecciona un tipo',
      'Justificación',
      'Objetivo General (ya agregado)',
    ]);
    expect(screen.getByRole('option', { name: 'Objetivo General (ya agregado)' })).toBeDisabled();
  });

  it('con todos los tipos usados avisa y no deja enviar', () => {
    // Arrange
    mockHook(vi.fn(), {
      items: [
        ITEM_USADO,
        { ...ITEM_USADO, id: 'i-2', tipoItem: { id: TIPOS[1].id, nombre: TIPOS[1].nombre } },
      ],
    });

    // Act
    render(<AgregarItemForm onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Tu ficha ya tiene un ítem de cada tipo.')).toBeInTheDocument();
    expect(enviar()).toBeDisabled();
  });

  it('con el catálogo vacío o con error avisa y no deja enviar', () => {
    // Arrange
    mockHook(vi.fn(), { tiposItem: [], errorTipos: true });

    // Act
    render(<AgregarItemForm onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('No hay tipos de ítem disponibles por ahora.')).toBeInTheDocument();
    expect(enviar()).toBeDisabled();
  });

  it('ITEM_TIPO_DUPLICADO muestra el mensaje junto al campo, con toast y sin cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(422, {
            message: 'Ya existe un ítem de ese tipo.',
            errorCode: 'ITEM_TIPO_DUPLICADO',
          }),
        ),
      ),
    );
    render(<AgregarItemForm onCerrar={onCerrar} />);

    // Act
    await completar(user);
    await user.click(enviar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar', 'Ya existe un ítem de ese tipo.');
    expect(await screen.findAllByText('Ya existe un ítem de ese tipo.')).not.toHaveLength(0);
    expect(screen.getByLabelText('Contenido')).toHaveValue('Medir el impacto');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('un error de estado terminal da toast y deja el panel abierto con los datos', async () => {
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
    await user.click(enviar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'Error al agregar',
      'La ficha está en estado terminal.',
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(enviar()).toBeEnabled();
  });

  it('un fieldError del backend se pinta junto al campo de contenido', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook(
      vi.fn((_req: unknown, opts: Opciones) =>
        opts.onError?.(
          errorApi(400, {
            fieldErrors: [{ field: 'contenido', message: 'Contenido no permitido.' }],
          }),
        ),
      ),
    );
    render(<AgregarItemForm onCerrar={vi.fn()} />);

    // Act
    await completar(user);
    await user.click(enviar());

    // Assert
    expect(await screen.findAllByText('Contenido no permitido.')).not.toHaveLength(0);
  });

  it('cerrar con el formulario limpio cierra y reinicia la mutación; con cambios pide confirmar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { reset } = mockHook();
    render(<AgregarItemForm onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(reset).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);

    // Act
    await user.type(screen.getByLabelText('Contenido'), 'algo');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(screen.getByText('¿Descartar los cambios?')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(2);
  });
});
