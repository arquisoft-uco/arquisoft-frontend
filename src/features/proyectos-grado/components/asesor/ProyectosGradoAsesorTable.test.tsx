import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ProyectosGradoAsesorTable from './ProyectosGradoAsesorTable';
import type { ProyectoGrado } from '../../models/ProyectoGrado';

const PROYECTO_1: ProyectoGrado = {
  id: 'p-1',
  fichaPerfil: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
};
const PROYECTO_2: ProyectoGrado = {
  id: 'p-2',
  fichaPerfil: 'f-2',
  tituloProyecto: 'Plataforma de riego',
  estado: { id: 'ATRASADO', nombre: 'Atrasado' },
};

function renderizar(parcial: Partial<React.ComponentProps<typeof ProyectosGradoAsesorTable>> = {}) {
  const props = {
    proyectos: [PROYECTO_1, PROYECTO_2],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'tituloProyecto', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<ProyectosGradoAsesorTable {...props} />);
  return props;
}

// jsdom no aplica CSS: la tabla y las tarjetas están las dos en el DOM, se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Proyectos de grado' }));
}

describe('ProyectosGradoAsesorTable', () => {
  it('muestra título y estado de cada proyecto como texto, sin enlaces', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla().getByText('En proceso')).toBeInTheDocument();
    expect(tabla().getByText('Atrasado')).toBeInTheDocument();
    expect(tabla().queryByRole('link')).not.toBeInTheDocument();
  });

  it('pulsar la cabecera Proyecto invierte la dirección del orden', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Proyecto' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('tituloProyecto', 'DESC');
  });

  it('sin proyectos y sin filtros muestra el vacío propio del asesor', () => {
    // Act
    renderizar({ proyectos: [] });

    // Assert
    expect(screen.getByText('Aún no tienes proyectos de grado asignados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin proyectos y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ proyectos: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });
});
