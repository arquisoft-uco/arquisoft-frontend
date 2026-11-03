import { describe, it, expect, vi } from 'vitest';

const { descargar } = vi.hoisted(() => ({ descargar: vi.fn() }));

vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar, descargando: false }),
}));
vi.mock('../../hooks/useEliminarVersionRepositorio', () => ({
  useEliminarVersionRepositorio: () => ({ mutate: vi.fn(), isPending: false }),
}));
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';
import VersionesRepositorioTable from './VersionesRepositorioTable';

const CON_HUELLA: VersionRepositorioArtefacto = {
  id: 'v-1',
  nombreDocumento: 'Manual de usuario',
  numeroVersion: 3,
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 2048,
  nombreArchivo: 'manual.pdf',
  hashSha256: 'abcdef0123456789abcdef',
};

const SIN_HUELLA: VersionRepositorioArtefacto = {
  ...CON_HUELLA,
  id: 'v-2',
  nombreDocumento: 'Guía técnica',
  numeroVersion: 1,
  hashSha256: undefined,
};

describe('VersionesRepositorioTable', () => {
  it('muestra documento, versión, tamaño legible y "No disponible" cuando falta la huella', () => {
    // Act
    render(
      <VersionesRepositorioTable
        repositorioId="r-1"
        versiones={[CON_HUELLA, SIN_HUELLA]}
        cargando={false}
      />,
    );

    // Assert
    expect(screen.getAllByText('Manual de usuario').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Versión 3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.0 KB').length).toBeGreaterThan(0);
    expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0);
  });

  it('sin versiones muestra el estado vacío', () => {
    // Act
    render(<VersionesRepositorioTable repositorioId="r-1" versiones={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Este repositorio aún no tiene versiones')).toBeInTheDocument();
  });

  it('el botón del estado vacío invoca onSubir y sin la prop no se muestra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubir = vi.fn();
    const { unmount } = render(
      <VersionesRepositorioTable
        repositorioId="r-1"
        versiones={[]}
        cargando={false}
        onSubir={onSubir}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    expect(onSubir).toHaveBeenCalledTimes(1);
    unmount();
    render(<VersionesRepositorioTable repositorioId="r-1" versiones={[]} cargando={false} />);
    expect(screen.queryByRole('button', { name: 'Subir versión' })).not.toBeInTheDocument();
  });

  it('cada versión tiene su menú con Descargar, que pide el id de esa versión', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <VersionesRepositorioTable
        repositorioId="r-1"
        versiones={[CON_HUELLA, SIN_HUELLA]}
        cargando={false}
      />,
    );

    // Act
    await user.click(
      screen.getAllByRole('button', { name: 'Acciones de Guía técnica versión 1' })[0],
    );
    await user.click(screen.getByRole('menuitem', { name: 'Descargar' }));

    // Assert
    expect(descargar).toHaveBeenCalledWith('v-2', 'Guía técnica');
  });

  it('solo la versión de mayor número de cada documento ofrece Eliminar', async () => {
    // Arrange
    const user = userEvent.setup();
    const anterior = { ...CON_HUELLA, id: 'v-0', numeroVersion: 2 };
    render(
      <VersionesRepositorioTable
        repositorioId="r-1"
        versiones={[CON_HUELLA, anterior]}
        cargando={false}
      />,
    );

    // Act
    await user.click(
      screen.getAllByRole('button', { name: 'Acciones de Manual de usuario versión 3' })[0],
    );

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(
      screen.getAllByRole('button', { name: 'Acciones de Manual de usuario versión 2' })[0],
    );
    expect(screen.queryByRole('menuitem', { name: 'Eliminar' })).not.toBeInTheDocument();
  });
});
