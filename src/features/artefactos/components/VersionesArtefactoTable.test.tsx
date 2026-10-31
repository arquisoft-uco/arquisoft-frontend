import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import VersionesArtefactoTable from './VersionesArtefactoTable';

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  uriArchivo: 'https://almacen.test/archivo-secreto.pdf',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
};

function renderizar(parcial: Partial<React.ComponentProps<typeof VersionesArtefactoTable>> = {}) {
  const props = {
    versiones: [VERSION],
    descripcionVacio: 'Aparecerán aquí tus versiones.',
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'fechaCreacion', direccion: 'DESC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<VersionesArtefactoTable {...props} />);
  return props;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Versiones de artefactos' }));
}

describe('VersionesArtefactoTable', () => {
  it('muestra proyecto, documento con su versión, repositorio, versión generada y fecha, sin pintar uriArchivo', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla().getByText('Acta de inicio')).toBeInTheDocument();
    expect(tabla().getByText('Versión 2 del documento')).toBeInTheDocument();
    expect(tabla().getByText('Repositorio base')).toBeInTheDocument();
    expect(tabla().getByText('Versión 4')).toBeInTheDocument();
    expect(tabla().getByText(/2026/)).toBeInTheDocument();
    expect(screen.queryByText(/archivo-secreto/)).not.toBeInTheDocument();
  });

  it('el asesor solo se pinta con mostrarAsesor', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().queryByText('Marta Gómez')).not.toBeInTheDocument();
    expect(tabla().queryByRole('columnheader', { name: 'Asesor' })).not.toBeInTheDocument();
  });

  it('con mostrarAsesor agrega la columna Asesor con su nombre', () => {
    // Act
    renderizar({ mostrarAsesor: true });

    // Assert
    expect(tabla().getByRole('columnheader', { name: 'Asesor' })).toBeInTheDocument();
    expect(tabla().getByText('Marta Gómez')).toBeInTheDocument();
  });

  it('muestra la insignia del estado de revisión o "Sin revisión" y ordena por estado', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar({
      versiones: [
        VERSION,
        {
          ...VERSION,
          id: 'v-2',
          revisionAsesor: 'r-1',
          estadoRevision: 'EN_PROGRESO',
          nombreEstadoRevision: 'En progreso',
        },
      ],
    });

    // Act
    await user.click(tabla().getByRole('button', { name: 'Estado de revisión' }));

    // Assert
    expect(tabla().getByText('Sin revisión')).toBeInTheDocument();
    expect(tabla().getByText('En progreso')).toBeInTheDocument();
    expect(onOrdenar).toHaveBeenCalledWith('estadoRevision', expect.any(String));
  });

  it('solo Versión, Estado de revisión y Fecha de creación ordenan y entregan su clave', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar({ mostrarAsesor: true });

    // Act
    await user.click(tabla().getByRole('button', { name: 'Versión' }));
    await user.click(tabla().getByRole('button', { name: 'Fecha de creación' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('version', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('fechaCreacion', expect.any(String));
    for (const nombre of ['Proyecto', 'Documento', 'Repositorio', 'Asesor']) {
      expect(tabla().queryByRole('button', { name: nombre })).not.toBeInTheDocument();
    }
  });

  it('sin versiones y sin filtros muestra el vacío informativo sin acción', () => {
    // Act
    renderizar({ versiones: [] });

    // Assert
    expect(screen.getByText('Aún no hay versiones de artefactos')).toBeInTheDocument();
    expect(screen.getByText('Aparecerán aquí tus versiones.')).toBeInTheDocument();
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
