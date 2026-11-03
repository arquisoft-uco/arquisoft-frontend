import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { useEliminarVersionArtefacto } from '../../hooks/useEliminarVersionArtefacto';
import EliminarVersionArtefactoDialog from './EliminarVersionArtefactoDialog';

vi.mock('../../hooks/useEliminarVersionArtefacto', () => ({
  useEliminarVersionArtefacto: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 3,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
  fechaCreacionRevision: null,
};

const mutate = vi.fn();

describe('EliminarVersionArtefactoDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEliminarVersionArtefacto).mockReturnValue({
      mutate,
      isPending: false,
    } as Partial<ReturnType<typeof useEliminarVersionArtefacto>> as ReturnType<
      typeof useEliminarVersionArtefacto
    >);
  });

  it('confirmar elimina la versión y, según el resultado, avisa con un toast y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<EliminarVersionArtefactoDialog version={VERSION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Eliminar versión' }));

    // Assert
    expect(screen.getByText(/¿Eliminar la versión 3 de «Acta de inicio»\?/)).toBeInTheDocument();
    expect(mutate).toHaveBeenCalledWith('v-1', expect.any(Object));
    const opciones = mutate.mock.calls[0][1];

    // Act
    opciones.onSuccess();

    // Assert
    expect(toast.success).toHaveBeenCalledWith('Versión eliminada');
    expect(onCerrar).toHaveBeenCalledTimes(1);

    // Act
    opciones.onError({ response: { data: { message: 'Solo puede eliminar la última' } } });

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar la versión', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(2);
  });

  it('cancelar cierra sin llamar al backend', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<EliminarVersionArtefactoDialog version={VERSION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});
