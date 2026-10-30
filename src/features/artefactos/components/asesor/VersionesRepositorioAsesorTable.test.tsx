import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { VersionRepositorioAsesor } from '../../models/VersionRepositorioAsesor';
import VersionesRepositorioAsesorTable from './VersionesRepositorioAsesorTable';

const VERSION: VersionRepositorioAsesor = {
  id: 'v-1',
  nombreDocumento: 'Acta de inicio',
  numeroVersion: 3,
  fechaCreacion: '2026-03-10T15:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 2048,
  nombreArchivo: 'acta-inicio.pdf',
  repositorioArtefacto: { id: 'r-1', nombreRepositorio: 'Repositorio base', descripcion: '' },
};

function renderizar(
  parcial: Partial<React.ComponentProps<typeof VersionesRepositorioAsesorTable>> = {},
) {
  const props = {
    versiones: [VERSION],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'nombreDocumento', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<VersionesRepositorioAsesorTable {...props} />);
  return props;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Versiones de repositorio' }));
}

describe('VersionesRepositorioAsesorTable', () => {
  it('muestra documento, archivo, repositorio, versión, tipo y tamaño legible', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Acta de inicio')).toBeInTheDocument();
    expect(tabla().getByText('acta-inicio.pdf')).toBeInTheDocument();
    expect(tabla().getByText('Repositorio base')).toBeInTheDocument();
    expect(tabla().getByText('Versión 3')).toBeInTheDocument();
    expect(tabla().getByText('application/pdf')).toBeInTheDocument();
    expect(tabla().getByText('2.0 KB')).toBeInTheDocument();
  });

  it('solo Documento, Repositorio, Versión y Fecha ordenan y entregan su clave', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Repositorio' }));
    await user.click(tabla().getByRole('button', { name: 'Versión' }));
    await user.click(tabla().getByRole('button', { name: 'Fecha de creación' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('nombreRepositorio', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('numeroVersion', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('fechaCreacion', expect.any(String));
    expect(tabla().getByRole('button', { name: 'Documento' })).toBeInTheDocument();
    expect(tabla().queryByRole('button', { name: 'Tipo de contenido' })).not.toBeInTheDocument();
    expect(tabla().queryByRole('button', { name: 'Tamaño' })).not.toBeInTheDocument();
  });

  it('sin versiones y sin filtros muestra el vacío informativo sin acción', () => {
    // Act
    renderizar({ versiones: [] });

    // Assert
    expect(screen.getByText('Aún no hay versiones de repositorio')).toBeInTheDocument();
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
