import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import EntregablesAsesorTable from './EntregablesAsesorTable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';

const ASESOR = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const ENTREGABLE_1: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 2,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: ASESOR,
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
};
const ENTREGABLE_2: EntregableProyectoGrado = {
  id: 'e-2',
  versionEntregable: 1,
  proyectoGrado: { id: 'p-2', nombre: 'Monitoreo de aire' },
  asesor: ASESOR,
  estadoEntregable: { id: 'EN_EVALUACION', nombre: 'En evaluación' },
};

function renderizar(parcial: Partial<React.ComponentProps<typeof EntregablesAsesorTable>> = {}) {
  const props = {
    entregables: [ENTREGABLE_1, ENTREGABLE_2],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'proyectoGradoNombre', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<EntregablesAsesorTable {...props} />);
  return props;
}

// jsdom no aplica CSS: la tabla y las tarjetas están las dos en el DOM, se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Entregables' }));
}

describe('EntregablesAsesorTable', () => {
  it('muestra proyecto, versión y estado de cada entregable', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla().getByText('Versión 2')).toBeInTheDocument();
    expect(tabla().getByText('Aprobado')).toBeInTheDocument();
    expect(tabla().getByText('En evaluación')).toBeInTheDocument();
  });

  it('ordena por Proyecto y por Versión, y Estado no es ordenable', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Proyecto' }));
    await user.click(tabla().getByRole('button', { name: 'Versión' }));

    // Assert
    expect(onOrdenar).toHaveBeenNthCalledWith(1, 'proyectoGradoNombre', 'DESC');
    expect(onOrdenar).toHaveBeenNthCalledWith(2, 'versionEntregable', 'ASC');
    expect(tabla().queryByRole('button', { name: 'Estado' })).not.toBeInTheDocument();
  });

  it('sin entregables y sin filtros muestra el vacío propio del asesor', () => {
    // Act
    renderizar({ entregables: [] });

    // Assert
    expect(screen.getByText('Aún no tienes entregables generados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin entregables y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ entregables: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });
});
