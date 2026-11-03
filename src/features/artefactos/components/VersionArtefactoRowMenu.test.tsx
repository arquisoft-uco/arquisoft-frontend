import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import { useDescargarVersionRepositorio } from '../../../shared/hooks/useDescargarVersionRepositorio';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import VersionArtefactoRowMenu from './VersionArtefactoRowMenu';

vi.mock('../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: vi.fn(),
}));

const VERSION = {
  id: 'v-1',
  version: 4,
  nombreDocumento: 'Acta de inicio',
} as VersionArtefacto;

const ETIQUETA = 'Acciones de la versión 4 de Acta de inicio';

const descargar = vi.fn();

function mockearHook(descargando = false) {
  vi.mocked(useDescargarVersionRepositorio).mockReturnValue({ descargar, descargando });
}

describe('VersionArtefactoRowMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockearHook();
  });

  it('muestra Ver información, Descargar y las acciones adicionales, en ese orden', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <VersionArtefactoRowMenu
        version={VERSION}
        onVerInformacion={vi.fn()}
        accionesAdicionales={() => [{ etiqueta: 'Eliminar', onSeleccionar: vi.fn() }]}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: ETIQUETA }));

    // Assert
    const items = screen.getAllByRole('menuitem').map((i) => i.textContent);
    expect(items).toEqual(['Ver información', 'Descargar', 'Eliminar']);
    expect(useDescargarVersionRepositorio).toHaveBeenCalledWith('artefacto');
  });

  it('Descargar pide la descarga con el id y el nombre del documento', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<VersionArtefactoRowMenu version={VERSION} onVerInformacion={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: ETIQUETA }));
    await user.click(screen.getByRole('menuitem', { name: 'Descargar' }));

    // Assert
    expect(descargar).toHaveBeenCalledWith('v-1', 'Acta de inicio');
  });

  it('Descargar sigue disponible aunque las acciones adicionales vengan vacías', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <VersionArtefactoRowMenu
        version={VERSION}
        onVerInformacion={vi.fn()}
        accionesAdicionales={() => []}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: ETIQUETA }));

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Descargar' })).toBeInTheDocument();
  });

  it('Descargar queda deshabilitada mientras se pide el enlace', async () => {
    // Arrange
    mockearHook(true);
    const user = userEvent.setup();
    render(<VersionArtefactoRowMenu version={VERSION} onVerInformacion={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: ETIQUETA }));
    await user.click(screen.getByRole('menuitem', { name: 'Descargar' }));

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Descargar' })).toBeDisabled();
    expect(descargar).not.toHaveBeenCalled();
  });
});
