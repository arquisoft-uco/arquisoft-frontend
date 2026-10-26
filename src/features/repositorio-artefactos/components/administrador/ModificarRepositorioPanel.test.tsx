import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';
import { useModificarRepositorioArtefacto } from '../../hooks/useModificarRepositorioArtefacto';
import type { RepositorioArtefacto } from '../../models/RepositorioArtefacto';
import ModificarRepositorioPanel from './ModificarRepositorioPanel';

vi.mock('../../hooks/useModificarRepositorioArtefacto', () => ({
  useModificarRepositorioArtefacto: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

type Resultado = ReturnType<typeof useModificarRepositorioArtefacto>;

const mutate = vi.fn();
const REPOSITORIO: RepositorioArtefacto = {
  id: 'r-1',
  nombreRepositorio: 'Repositorio Alfa',
  descripcion: 'Artefactos del semillero',
};

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

function mutarFallando(cuerpo: ApiError) {
  const err = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
  mutate.mockImplementation((_v: unknown, opciones: OpcionesMutate) => opciones.onError(err));
}

async function editarYGuardar() {
  const user = userEvent.setup();
  const onCerrar = vi.fn();
  render(<ModificarRepositorioPanel repositorio={REPOSITORIO} onCerrar={onCerrar} />);
  const descripcion = screen.getByLabelText('Descripción');
  await user.clear(descripcion);
  await user.type(descripcion, 'Nueva descripción');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  return { user, onCerrar };
}

describe('ModificarRepositorioPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const base: Partial<Resultado> = { mutate, isPending: false, reset: vi.fn() };
    vi.mocked(useModificarRepositorioArtefacto).mockReturnValue(base as Resultado);
  });

  it('precarga los valores de la fila y deshabilita guardar mientras no haya cambios', () => {
    // Act
    render(<ModificarRepositorioPanel repositorio={REPOSITORIO} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText('Nombre')).toHaveValue('Repositorio Alfa');
    expect(screen.getByLabelText('Descripción')).toHaveValue('Artefactos del semillero');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('con cambios válidos envía id y valores, avisa el éxito y cierra', async () => {
    // Arrange
    mutate.mockImplementation((_v: unknown, opciones: OpcionesMutate) => opciones.onSuccess());

    // Act
    const { onCerrar } = await editarYGuardar();

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(mutate).toHaveBeenCalledWith(
      {
        repositorioId: 'r-1',
        req: { nombreRepositorio: 'Repositorio Alfa', descripcion: 'Nueva descripción' },
      },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Repositorio actualizado', expect.any(String));
  });

  it('con la descripción vacía no envía y muestra los errores', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarRepositorioPanel repositorio={REPOSITORIO} onCerrar={vi.fn()} />);

    // Act
    await user.clear(screen.getByLabelText('Descripción'));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante un nombre duplicado avisa con toast, marca el campo y deja el panel abierto', async () => {
    // Arrange
    mutarFallando({
      error: 'Unprocessable Entity',
      errorCode: 'REPOSITORIO_ARTEFACTO_DUPLICADO',
      message: 'dup',
      status: 422,
    });

    // Act
    const { onCerrar } = await editarYGuardar();

    // Assert
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText('Ya existe un repositorio con este nombre.').length).toBeGreaterThan(
      0,
    );
    expect(screen.getByLabelText('Descripción')).toHaveValue('Nueva descripción');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si el repositorio ya no existe avisa con toast y cierra el panel', async () => {
    // Arrange
    mutarFallando({
      error: 'Unprocessable Entity',
      errorCode: 'REPOSITORIO_ARTEFACTO_NO_ENCONTRADO',
      message: 'No existe',
      status: 422,
    });

    // Act
    const { onCerrar } = await editarYGuardar();

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith('No se pudo actualizar el repositorio', 'No existe');
  });

  it('con administrador no vigente y sin mensaje usa el texto de respaldo y deja el panel abierto', async () => {
    // Arrange
    mutarFallando({
      error: 'Unprocessable Entity',
      errorCode: 'ADMINISTRADOR_NO_VIGENTE',
      status: 422,
    } as ApiError);

    // Act
    const { onCerrar } = await editarYGuardar();

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo actualizar el repositorio',
        'Tu cuenta de administrador no está vigente.',
      ),
    );
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
