import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import DocumentacionesTable from './DocumentacionesTable';
import type { Documentacion } from '../models/Documentacion';

const DOC_1: Documentacion = {
  id: 'd-1',
  tituloProyecto: 'Sistema de Gestión Académica',
  autores: [{ id: 'a-1', identificador: 'ana', nombre: 'Ana Pérez' }],
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 2 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};
const DOC_2: Documentacion = {
  id: 'd-2',
  tituloProyecto: null,
  autores: [],
  fechaPublicacion: '2026-10-15T10:00:00Z',
  entregableProyectoGrado: { id: 'e-2', versionEntregable: 1 },
  bibliotecario: { id: 'b-2', nombre: 'Carlos Ruiz' },
  estadoDocumentacion: { id: 'PENDIENTE', nombre: 'Pendiente' },
};

function renderizar(parcial: Partial<React.ComponentProps<typeof DocumentacionesTable>> = {}) {
  const props = {
    documentaciones: [DOC_1, DOC_2],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'fechaPublicacion', direccion: 'DESC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<DocumentacionesTable {...props} />);
  return props;
}

// jsdom no aplica CSS: la tabla y las tarjetas están las dos en el DOM, se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Documentaciones' }));
}

describe('DocumentacionesTable', () => {
  it('muestra estado, versión y bibliotecario de cada documentación', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Publicado')).toBeInTheDocument();
    expect(tabla().getByText('Pendiente')).toBeInTheDocument();
    expect(tabla().getByText('Versión 2')).toBeInTheDocument();
    expect(tabla().getByText('Sistema de Gestión Académica')).toBeInTheDocument();
    expect(tabla().getByText('Laura Gómez')).toBeInTheDocument();
    expect(tabla().getByText('Carlos Ruiz')).toBeInTheDocument();
  });

  it('muestra las columnas Proyecto y Autores, ninguna ordenable', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByRole('columnheader', { name: 'Proyecto' })).toBeInTheDocument();
    expect(tabla().getByRole('columnheader', { name: 'Autores' })).toBeInTheDocument();
    expect(tabla().queryByRole('button', { name: 'Proyecto' })).not.toBeInTheDocument();
    expect(tabla().queryByRole('button', { name: 'Autores' })).not.toBeInTheDocument();
  });

  it('con título nulo muestra "Sin título" y conserva versión y bibliotecario', () => {
    // Act
    renderizar({ documentaciones: [DOC_2] });

    // Assert
    expect(tabla().getByText('Sin título')).toBeInTheDocument();
    expect(tabla().getByText('Versión 1')).toBeInTheDocument();
    expect(tabla().getByText('Carlos Ruiz')).toBeInTheDocument();
  });

  it('muestra un autor sin el respaldo de autores vacíos', () => {
    // Act
    renderizar({ documentaciones: [DOC_1] });

    // Assert
    expect(tabla().getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla().queryByText('Sin autores registrados')).not.toBeInTheDocument();
  });

  it('une varios autores con comas y "y" final', () => {
    // Arrange
    const autores = [
      { id: 'a-1', identificador: 'andres', nombre: 'Andrés Ruiz' },
      { id: 'a-2', identificador: 'laura', nombre: 'Laura Gómez' },
      { id: 'a-3', identificador: 'pedro', nombre: 'Pedro Díaz' },
    ];

    // Act
    renderizar({ documentaciones: [{ ...DOC_1, autores }] });

    // Assert
    expect(tabla().getByText('Andrés Ruiz, Laura Gómez y Pedro Díaz')).toBeInTheDocument();
  });

  it('con autores vacíos muestra "Sin autores registrados"', () => {
    // Act
    renderizar({ documentaciones: [DOC_2] });

    // Assert
    expect(tabla().getByText('Sin autores registrados')).toBeInTheDocument();
  });

  it('en la tarjeta móvil muestra título, autores con prefijo accesible y respaldos', () => {
    // Act
    renderizar();
    const lista = within(screen.getByRole('list', { name: 'Documentaciones' }));

    // Assert
    expect(lista.getByText('Sistema de Gestión Académica')).toBeInTheDocument();
    expect(lista.getByText('Ana Pérez')).toBeInTheDocument();
    expect(lista.getAllByText('Autores:').length).toBeGreaterThan(0);
    expect(lista.getByText('Sin título')).toBeInTheDocument();
  });

  it('ordena por fecha de publicación con la dirección contraria y Estado no es ordenable', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Fecha de publicación' }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('fechaPublicacion', 'ASC');
    expect(tabla().queryByRole('button', { name: 'Estado' })).not.toBeInTheDocument();
  });

  it('sin documentaciones y sin filtros muestra el vacío sin "Limpiar filtros"', () => {
    // Act
    renderizar({ documentaciones: [] });

    // Assert
    expect(screen.getByText('Aún no hay documentaciones')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin documentaciones y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ documentaciones: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('con onVerAutores cada fila ofrece "Ver autores" que lo llama con esa documentación', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onVerAutores } = renderizar({ onVerAutores: vi.fn() });

    // Act
    await user.click(
      tabla().getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver autores' }));

    // Assert
    expect(onVerAutores).toHaveBeenCalledWith(DOC_1);
  });

  it('con onCambiarEstado cada fila ofrece solo los destinos de su estado y elegir uno lo llama', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCambiarEstado } = renderizar({ onCambiarEstado: vi.fn() });
    const abrir = (version: number) =>
      user.click(
        tabla().getByRole('button', { name: `Acciones de la documentación, versión ${version}` }),
      );

    // Act
    await abrir(1);

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Publicar' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Marcar como no publicada' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Ver autores' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('menuitem', { name: 'Publicar' }));
    await abrir(2);

    // Assert
    expect(onCambiarEstado).toHaveBeenCalledWith(DOC_2, 'PUBLICADO');
    expect(screen.queryByRole('menuitem', { name: 'Publicar' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Marcar como no publicada' })).toBeInTheDocument();
  });

  it('una documentación no publicada solo ofrece "Publicar"', async () => {
    // Arrange
    const user = userEvent.setup();
    const noPublicada = {
      ...DOC_1,
      estadoDocumentacion: { id: 'NO_PUBLICADO', nombre: 'No Publicado' },
    };
    renderizar({ documentaciones: [noPublicada], onCambiarEstado: vi.fn() });

    // Act
    await user.click(
      tabla().getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
    );

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Publicar' })).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Marcar como no publicada' }),
    ).not.toBeInTheDocument();
  });

  it('con onDescargar cada fila ofrece "Descargar" primero y elegirla lo llama con esa fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onDescargar } = renderizar({ onDescargar: vi.fn(), onVerAutores: vi.fn() });

    // Act
    await user.click(
      tabla().getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
    );
    const opciones = screen.getAllByRole('menuitem');

    // Assert
    expect(opciones[0]).toHaveAccessibleName('Descargar');
    expect(opciones[1]).toHaveAccessibleName('Ver autores');

    // Act
    await user.click(opciones[0]);

    // Assert
    expect(onDescargar).toHaveBeenCalledWith(DOC_1);
  });

  it('con descargando la opción "Descargar" aparece deshabilitada', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar({ onDescargar: vi.fn(), descargando: true });

    // Act
    await user.click(
      tabla().getByRole('button', { name: 'Acciones de la documentación, versión 2' }),
    );

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Descargar' })).toBeDisabled();
  });

  it('sin onVerAutores, onCambiarEstado ni onDescargar no hay menú de acciones por fila', () => {
    // Act
    renderizar();

    // Assert
    expect(
      tabla().queryByRole('button', { name: /Acciones de la documentación/ }),
    ).not.toBeInTheDocument();
  });
});
