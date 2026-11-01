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
    onOmitir: vi.fn(),
    onReactivar: vi.fn(),
    onGestionarEstudiantes: vi.fn(),
    ...parcial,
  };
  render(<ArtefactosAsesorTable {...props} />, { initialPath: '/artefactos' });
  return props;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Artefactos asignados' }));
}

describe('ArtefactosAsesorTable', () => {
  it('la fila activa ofrece "Omitir artefacto" y la omitida "Reactivar artefacto", cada una con la fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const omitido = { ...ARTEFACTO, id: 'a-2', nombreDocumento: 'Anteproyecto', omitido: true };
    const { onOmitir, onReactivar } = renderizar({ artefactos: [ARTEFACTO, omitido] });

    // Act
    await user.click(tabla().getByRole('button', { name: 'Acciones de Acta de inicio' }));
    expect(screen.queryByRole('menuitem', { name: 'Reactivar artefacto' })).toBeNull();
    await user.click(screen.getByRole('menuitem', { name: 'Omitir artefacto' }));
    await user.click(tabla().getByRole('button', { name: 'Acciones de Anteproyecto' }));
    expect(screen.queryByRole('menuitem', { name: 'Omitir artefacto' })).toBeNull();
    await user.click(screen.getByRole('menuitem', { name: 'Reactivar artefacto' }));

    // Assert
    expect(onOmitir).toHaveBeenCalledWith(ARTEFACTO);
    expect(onReactivar).toHaveBeenCalledWith(omitido);
  });

  it('la fila activa ofrece "Gestionar estudiantes" y la omitida "Ver estudiantes", cada una con la fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const omitido = { ...ARTEFACTO, id: 'a-2', nombreDocumento: 'Anteproyecto', omitido: true };
    const { onGestionarEstudiantes } = renderizar({ artefactos: [ARTEFACTO, omitido] });

    // Act
    await user.click(tabla().getByRole('button', { name: 'Acciones de Acta de inicio' }));
    expect(screen.queryByRole('menuitem', { name: 'Ver estudiantes' })).toBeNull();
    await user.click(screen.getByRole('menuitem', { name: 'Gestionar estudiantes' }));
    await user.click(tabla().getByRole('button', { name: 'Acciones de Anteproyecto' }));
    expect(screen.queryByRole('menuitem', { name: 'Gestionar estudiantes' })).toBeNull();
    await user.click(screen.getByRole('menuitem', { name: 'Ver estudiantes' }));

    // Assert
    expect(onGestionarEstudiantes).toHaveBeenNthCalledWith(1, ARTEFACTO);
    expect(onGestionarEstudiantes).toHaveBeenNthCalledWith(2, omitido);
  });

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
