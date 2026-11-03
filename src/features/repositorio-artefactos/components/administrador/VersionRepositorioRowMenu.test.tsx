import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar: vi.fn(), descargando: false }),
}));
vi.mock('../../hooks/useEliminarVersionRepositorio', () => ({
  useEliminarVersionRepositorio: () => ({ mutate: vi.fn(), isPending: false }),
}));
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';
import VersionRepositorioRowMenu from './VersionRepositorioRowMenu';

const VERSION: VersionRepositorioArtefacto = {
  id: 'v-2',
  nombreDocumento: 'Manual',
  numeroVersion: 2,
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 1,
  nombreArchivo: 'a.pdf',
};
const MENU = { name: 'Acciones de Manual versión 2' };

describe('VersionRepositorioRowMenu', () => {
  it('con puedeEliminar ofrece Eliminar y abre la confirmación', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<VersionRepositorioRowMenu version={VERSION} repositorioId="r-1" puedeEliminar />);

    // Act
    await user.click(screen.getByRole('button', MENU));
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }));

    // Assert
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
  });

  it('sin puedeEliminar solo ofrece Descargar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <VersionRepositorioRowMenu version={VERSION} repositorioId="r-1" puedeEliminar={false} />,
    );

    // Act
    await user.click(screen.getByRole('button', MENU));

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Descargar' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Eliminar' })).not.toBeInTheDocument();
  });
});
