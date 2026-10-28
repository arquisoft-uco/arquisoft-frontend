import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { VersionArtefactoAsesor } from '../../models/VersionArtefactoAsesor';
import VersionesArtefactoAsesorTable from './VersionesArtefactoAsesorTable';

const VERSION: VersionArtefactoAsesor = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  uriArchivo: 'https://almacen.test/archivo-secreto.pdf',
};

const ARTEFACTO: ArtefactoAsesor = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
};

function renderizar(
  parcial: Partial<React.ComponentProps<typeof VersionesArtefactoAsesorTable>> = {},
) {
  const props = {
    versiones: [VERSION],
    artefactoDe: (id: string) => (id === ARTEFACTO.id ? ARTEFACTO : undefined),
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'fechaCreacion', direccion: 'DESC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<VersionesArtefactoAsesorTable {...props} />);
  return props;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Versiones de artefactos' }));
}

describe('VersionesArtefactoAsesorTable', () => {
  it('muestra documento, proyecto, "Versión N" y la fecha, sin pintar uriArchivo', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Acta de inicio')).toBeInTheDocument();
    expect(tabla().getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla().getByText('Versión 4')).toBeInTheDocument();
    expect(tabla().getByText(/2026/)).toBeInTheDocument();
    expect(screen.queryByText(/archivo-secreto/)).not.toBeInTheDocument();
  });

  it('sin el artefacto en el catálogo muestra "Artefacto sin nombre"', () => {
    // Act
    renderizar({ artefactoDe: () => undefined });

    // Assert
    expect(tabla().getByText('Artefacto sin nombre')).toBeInTheDocument();
  });

  it('solo Versión y Fecha de creación ordenan y entregan su clave', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Versión' }));
    await user.click(tabla().getByRole('button', { name: 'Fecha de creación' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('version', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('fechaCreacion', expect.any(String));
    expect(tabla().queryByRole('button', { name: 'Artefacto' })).not.toBeInTheDocument();
  });

  it('sin versiones y sin filtros muestra el vacío informativo sin acción', () => {
    // Act
    renderizar({ versiones: [] });

    // Assert
    expect(screen.getByText('Aún no hay versiones de artefactos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin versiones y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ versiones: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });
});
