import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import ProyectosGradoTable from './ProyectosGradoTable';
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

function renderizar(parcial: Partial<React.ComponentProps<typeof ProyectosGradoTable>> = {}) {
  const props = {
    proyectos: [PROYECTO_1, PROYECTO_2],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'tituloProyecto', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<ProyectosGradoTable {...props} />);
  return props;
}

function SondaState() {
  const { state } = useLocation();
  return <output aria-label="state de navegación">{JSON.stringify(state)}</output>;
}

// La tabla y la lista de tarjetas están las dos en el DOM (jsdom no aplica CSS): se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Proyectos de grado' }));
}

describe('ProyectosGradoTable', () => {
  it('muestra título, estado del backend y enlace a la ficha de origen', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla().getByText('En proceso')).toBeInTheDocument();
    expect(tabla().getByText('Atrasado')).toBeInTheDocument();
    expect(
      tabla().getByRole('link', { name: 'Ver la ficha de perfil de Sistema de monitoreo' }),
    ).toHaveAttribute('href', '/fichas-perfil/f-1/evaluaciones');
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

  it('sin proyectos y sin filtros muestra el vacío "sin datos"', () => {
    // Act
    renderizar({ proyectos: [] });

    // Assert
    expect(screen.getByText('Aún no tienes proyectos de grado')).toBeInTheDocument();
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

  it('el enlace a la ficha navega con el state que lee el detalle: search, resumen y origen', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <>
        <ProyectosGradoTable
          proyectos={[PROYECTO_1]}
          cargando={false}
          hayFiltros={false}
          orden={{ clave: 'tituloProyecto', direccion: 'ASC' }}
          onOrdenar={vi.fn()}
          onLimpiarFiltros={vi.fn()}
        />
        <SondaState />
      </>,
      { initialPath: '/proyectos-grado?q=sis' },
    );

    // Act
    await user.click(
      tabla().getByRole('link', { name: 'Ver la ficha de perfil de Sistema de monitoreo' }),
    );

    // Assert
    expect(JSON.parse(screen.getByLabelText('state de navegación').textContent ?? '')).toEqual({
      search: '?q=sis',
      resumen: { id: 'f-1', titulo: 'Sistema de monitoreo' },
      origen: { etiqueta: 'Proyectos de grado', to: '/proyectos-grado' },
    });
  });
});
