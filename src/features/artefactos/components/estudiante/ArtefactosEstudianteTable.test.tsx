import { describe, it, expect, vi } from 'vitest';

const { descargar } = vi.hoisted(() => ({ descargar: vi.fn() }));

vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar, descargando: false }),
}));
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';
import ArtefactosEstudianteTable from './ArtefactosEstudianteTable';

const ARTEFACTO: ArtefactoEstudiante = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  asesor: 's-1',
  nombreAsesor: 'Ana Pérez',
  omitido: false,
};

function renderizar(parcial: Partial<React.ComponentProps<typeof ArtefactosEstudianteTable>> = {}) {
  const props = {
    artefactos: [ARTEFACTO],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'nombreProyecto', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<ArtefactosEstudianteTable {...props} />);
  return props;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Artefactos de mis proyectos de grado' }));
}

describe('ArtefactosEstudianteTable', () => {
  it('muestra proyecto, documento, versión, repositorio y asesor', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla().getByText('Acta de inicio')).toBeInTheDocument();
    expect(tabla().getByText('Versión 2')).toBeInTheDocument();
    expect(tabla().getByText('Repositorio base')).toBeInTheDocument();
    expect(tabla().getByText('Ana Pérez')).toBeInTheDocument();
  });

  it('muestra "Omitido" solo en la fila omitida', () => {
    // Act
    renderizar({
      artefactos: [
        ARTEFACTO,
        { ...ARTEFACTO, id: 'a-2', nombreDocumento: 'Anteproyecto', omitido: true },
      ],
    });

    // Assert
    expect(tabla().getAllByText('Omitido')).toHaveLength(1);
  });

  it('las cinco columnas ordenan y entregan su clave', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Documento' }));
    await user.click(tabla().getByRole('button', { name: 'Versión' }));
    await user.click(tabla().getByRole('button', { name: 'Asesor' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('nombreDocumento', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('versionDocumento', expect.any(String));
    expect(onOrdenar).toHaveBeenCalledWith('nombreAsesor', expect.any(String));
  });

  it('sin artefactos y sin filtros muestra el vacío informativo sin acción', () => {
    // Act
    renderizar({ artefactos: [] });

    // Assert
    expect(screen.getByText('Aún no hay artefactos en tus proyectos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin artefactos y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ artefactos: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('cada fila tiene un menú con Descargar que pide la versión del repositorio de esa fila', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar({
      artefactos: [
        ARTEFACTO,
        {
          ...ARTEFACTO,
          id: 'a-2',
          versionRepositorioArtefacto: 'r-2',
          nombreDocumento: 'Anteproyecto',
          omitido: true,
        },
      ],
    });

    // Act
    await user.click(tabla().getByRole('button', { name: 'Acciones de Anteproyecto' }));
    await user.click(screen.getByRole('menuitem', { name: 'Descargar' }));

    // Assert
    expect(descargar).toHaveBeenCalledWith('r-2', 'Anteproyecto');
    expect(tabla().getByRole('button', { name: 'Acciones de Acta de inicio' })).toBeInTheDocument();
  });
});
