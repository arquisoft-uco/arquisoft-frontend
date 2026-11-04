import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';
import { toast } from '../../../../shared/hooks/useToast';
import { VERSION_EN_USO } from '../../utils/errores-eliminar-version';
import EliminarVersionRepositorioDialog from './EliminarVersionRepositorioDialog';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock('../../hooks/useEliminarVersionRepositorio', () => ({
  useEliminarVersionRepositorio: () => ({ mutate, isPending: false }),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const VERSION: VersionRepositorioArtefacto = {
  id: 'v-2',
  nombreDocumento: 'Manual',
  numeroVersion: 2,
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 1,
  nombreArchivo: 'a.pdf',
};

function montar() {
  const onCerrar = vi.fn();
  render(
    <EliminarVersionRepositorioDialog version={VERSION} repositorioId="r-1" onCerrar={onCerrar} />,
  );
  return onCerrar;
}

describe('EliminarVersionRepositorioDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirmar elimina la versión, avisa del éxito y cierra', async () => {
    // Arrange
    mutate.mockImplementation((_id, opciones) => opciones.onSuccess());
    const onCerrar = montar();

    // Act
    await userEvent.setup().click(screen.getByRole('button', { name: 'Eliminar versión' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toBe('v-2');
    expect(toast.success).toHaveBeenCalledWith('Versión eliminada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('un error muestra el motivo del backend en un toast y cierra', async () => {
    // Arrange
    const err = new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
      data: { error: 'Unprocessable Entity', errorCode: VERSION_EN_USO, message: 'm', status: 422 },
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    mutate.mockImplementation((_id, opciones) => opciones.onError(err));
    const onCerrar = montar();

    // Act
    await userEvent.setup().click(screen.getByRole('button', { name: 'Eliminar versión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la versión',
      'Esta versión está asignada a artefactos de proyectos de grado y no se puede eliminar.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cancelar cierra sin llamar al backend', async () => {
    // Arrange
    const onCerrar = montar();

    // Act
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
