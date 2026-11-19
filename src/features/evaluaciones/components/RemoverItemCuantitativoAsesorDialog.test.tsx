import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../test-utils/render';
import RemoverItemCuantitativoAsesorDialog from './RemoverItemCuantitativoAsesorDialog';
import { useRemoverItemCuantitativoAsesor } from '../hooks/useRemoverItemCuantitativoAsesor';
import { toast } from '../../../shared/hooks/useToast';
import type { ApiError } from '../../../shared/models/api-response';
import type { ItemCuantitativoAsesor } from '../models/ItemCuantitativoAsesor';

vi.mock('../hooks/useRemoverItemCuantitativoAsesor', () => ({
  useRemoverItemCuantitativoAsesor: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const ITEM: ItemCuantitativoAsesor = {
  id: 'i-1',
  nombre: 'Rigor',
  descripcion: 'Calidad del método.',
  categoriaId: 'c-1',
  valor: 30,
};

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function mockMutacion(mutate = vi.fn()) {
  vi.mocked(useRemoverItemCuantitativoAsesor).mockReturnValue({
    isPending: false,
    mutate,
  } as Partial<ReturnType<typeof useRemoverItemCuantitativoAsesor>> as ReturnType<
    typeof useRemoverItemCuantitativoAsesor
  >);
  return mutate;
}

function mutateConError(err: unknown) {
  return vi.fn((_id: string, opciones?: MutateOptions) => opciones?.onError?.(err));
}

describe('RemoverItemCuantitativoAsesorDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nombra el ítem y, al confirmar, envía su id y cierra con toast de éxito', async () => {
    // Arrange
    const mutate = mockMutacion(
      vi.fn((_id: string, opciones?: MutateOptions) => opciones?.onSuccess?.()),
    );
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RemoverItemCuantitativoAsesorDialog item={ITEM} onCerrar={onCerrar} />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Rigor');

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('i-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Ítem removido', expect.stringContaining('Rigor'));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra sin enviar ni notificar', async () => {
    // Arrange
    const mutate = mockMutacion();
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RemoverItemCuantitativoAsesorDialog item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante el 422 de ítem en uso muestra texto propio con el nombre y cierra', async () => {
    // Arrange
    mockMutacion(
      mutateConError(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'ITEM_CUANTITATIVO_ASESOR_EN_USO',
          message: 'mensaje del backend',
          status: 422,
        }),
      ),
    );
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RemoverItemCuantitativoAsesorDialog item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo remover el ítem',
      'No se puede remover «Rigor» porque ya fue usado en evaluaciones del asesor.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante el 422 de ítem no encontrado indica que ya no existe', async () => {
    // Arrange
    mockMutacion(
      mutateConError(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'ITEM_CUANTITATIVO_ASESOR_NO_ENCONTRADO',
          message: 'No existe el UUID',
          status: 422,
        }),
      ),
    );
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RemoverItemCuantitativoAsesorDialog item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo remover el ítem', 'El ítem ya no existe.');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ante un error sin código usa el mensaje de respaldo y cierra', async () => {
    // Arrange
    mockMutacion(mutateConError(new Error('red')));
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RemoverItemCuantitativoAsesorDialog item={ITEM} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo remover el ítem', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
