import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import FichasPerfilTable from './FichasPerfilTable';
import type { FichaPerfil } from '../../models/FichaPerfil';

const FICHA_1: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};
const FICHA_2: FichaPerfil = {
  id: 'f-2',
  tituloProyecto: 'Plataforma de riego',
  asesorFicha: { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' },
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};

function renderizar(parcial: Partial<React.ComponentProps<typeof FichasPerfilTable>> = {}) {
  const props = {
    fichas: [FICHA_1, FICHA_2],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'tituloProyecto', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onVerEstudiantes: vi.fn(),
    onCambiarAsesor: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<FichasPerfilTable {...props} />);
  return props;
}

// La tabla y la lista de tarjetas están las dos en el DOM (jsdom no aplica CSS): se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Fichas de perfil' }));
}

describe('FichasPerfilTable', () => {
  it('muestra el título de cada ficha y su asesor con el correo', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla().getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla().getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(tabla().getByText('Plataforma de riego')).toBeInTheDocument();
  });

  it('muestra el estado actual y la fecha de cada ficha, en la tabla y en la tarjeta de celular, sin ordenar por ellos', () => {
    // Act
    renderizar();
    const tarjetas = within(screen.getByRole('list', { name: 'Fichas de perfil' }));

    // Assert
    expect(tabla().getAllByText('En revisión')).toHaveLength(2);
    const fechas = tabla()
      .getAllByText((_, el) => el?.tagName === 'TIME')
      .map((el) => el.getAttribute('datetime'));
    expect(fechas).toEqual(['2026-10-01T15:30:00', '2026-10-01T15:30:00']);
    expect(tabla().getByRole('columnheader', { name: 'Estado actual' })).toBeInTheDocument();
    expect(tabla().getByRole('columnheader', { name: 'Última actualización' })).toBeInTheDocument();
    expect(tabla().queryByRole('button', { name: 'Estado actual' })).not.toBeInTheDocument();
    expect(tabla().queryByRole('button', { name: 'Última actualización' })).not.toBeInTheDocument();
    expect(tarjetas.getAllByText('En revisión')).toHaveLength(2);
    expect(tarjetas.getAllByText((_, el) => el?.tagName === 'TIME')).toHaveLength(2);
  });

  it('sin fichas y sin filtros muestra el vacío "sin datos"', () => {
    // Act
    renderizar({ fichas: [] });

    // Assert
    expect(screen.getByText('Aún no hay fichas de perfil')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin fichas y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ fichas: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('"Ver estudiantes" y "Cambiar asesor" del menú actúan sobre la ficha de esa fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onVerEstudiantes, onCambiarAsesor } = renderizar();

    // Act
    await user.click(
      tabla().getByRole('button', { name: 'Acciones de la ficha Plataforma de riego' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver estudiantes' }));
    await user.click(
      tabla().getByRole('button', { name: 'Acciones de la ficha Sistema de monitoreo' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Cambiar asesor' }));

    // Assert
    expect(onVerEstudiantes).toHaveBeenCalledWith(FICHA_2);
    expect(onCambiarAsesor).toHaveBeenCalledWith(FICHA_1);
  });

  it('ordenar desde la cabecera Ficha invierte la dirección y desde Asesor ordena por asesor', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Ficha' }));
    await user.click(tabla().getByRole('button', { name: 'Asesor' }));

    // Assert
    expect(onOrdenar).toHaveBeenNthCalledWith(1, 'tituloProyecto', 'DESC');
    expect(onOrdenar).toHaveBeenNthCalledWith(2, 'asesorNombre', 'ASC');
  });
});
