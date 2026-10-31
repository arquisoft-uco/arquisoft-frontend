import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import ArtefactosAsesorTable from './ArtefactosAsesorTable';

const ARTEFACTO: ArtefactoAsesor = {
  id: '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  omitido: false,
};

function renderizar(parcial: Partial<React.ComponentProps<typeof ArtefactosAsesorTable>> = {}) {
  const props = {
    artefactos: [ARTEFACTO],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'nombreProyecto', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<ArtefactosAsesorTable {...props} />, { initialPath: '/artefactos' });
  return props;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Artefactos asignados' }));
}

describe('ArtefactosAsesorTable', () => {
  it('muestra proyecto, documento con su versión y repositorio, con el documento como enlace a sus versiones', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla().getByText('Versión 2 del documento')).toBeInTheDocument();
    expect(tabla().getByText('Repositorio base')).toBeInTheDocument();
    expect(tabla().getByRole('link', { name: 'Ver versiones de Acta de inicio' })).toHaveAttribute(
      'href',
      `/artefactos?vista=versiones-artefactos&artefacto=${ARTEFACTO.id}`,
    );
  });

  it('un artefacto omitido lleva la insignia "Omitido"', () => {
    // Act
    renderizar({ artefactos: [{ ...ARTEFACTO, omitido: true }] });

    // Assert
    expect(tabla().getByText('Omitido')).toBeInTheDocument();
  });

  it('las tres columnas ordenan y entregan su clave', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Proyecto' }));
    await user.click(tabla().getByRole('button', { name: 'Documento' }));
    await user.click(tabla().getByRole('button', { name: 'Repositorio' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('nombreProyecto', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('nombreDocumento', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('nombreRepositorio', expect.any(String));
  });

  it('sin artefactos y sin filtros muestra el vacío informativo sin acción', () => {
    // Act
    renderizar({ artefactos: [] });

    // Assert
    expect(screen.getByText('Aún no tienes artefactos asignados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin artefactos y con búsqueda muestra "Sin resultados" y "Limpiar filtros" la quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ artefactos: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });
});
