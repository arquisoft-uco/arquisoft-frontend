import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { RevisionAsesor } from '../../models/RevisionAsesor';
import RevisionesRealizadasTable from './RevisionesRealizadasTable';

const REVISION: RevisionAsesor = {
  id: 'r-1',
  versionArtefactoId: 'v-1',
  artefactoId: 'a-1',
  version: 3,
  estadoId: 'PENDIENTE',
  estadoNombre: 'Pendiente',
};

function renderizar(parcial: Partial<React.ComponentProps<typeof RevisionesRealizadasTable>> = {}) {
  const props = {
    revisiones: [REVISION],
    cargando: false,
    hayFiltros: false,
    direccionOrden: 'ASC' as const,
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    onVerObservaciones: vi.fn(),
    ...parcial,
  };
  render(<RevisionesRealizadasTable {...props} />);
  return props;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Revisiones realizadas' }));
}

describe('RevisionesRealizadasTable', () => {
  it('muestra la versión y el nombre del estado de la revisión', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Versión 3')).toBeInTheDocument();
    expect(tabla().getByText('Pendiente')).toBeInTheDocument();
  });

  it('"Ver observaciones" del menú de fila entrega la revisión', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onVerObservaciones } = renderizar();

    // Act
    await user.click(
      tabla().getByRole('button', { name: 'Acciones de la revisión de la versión 3' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Ver observaciones' }));

    // Assert
    expect(onVerObservaciones).toHaveBeenCalledWith(REVISION);
  });

  it('pulsar el encabezado Estado invierte la dirección del orden', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Estado' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('DESC');
  });

  it('sin revisiones y sin filtros muestra el vacío informativo sin acción', () => {
    // Act
    renderizar({ revisiones: [] });

    // Assert
    expect(screen.getByText('Aún no has realizado revisiones')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin revisiones y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ revisiones: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });
});
