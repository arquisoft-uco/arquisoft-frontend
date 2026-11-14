import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import DocumentacionesTable from './DocumentacionesTable';
import type { Documentacion } from '../models/Documentacion';

const DOC_1: Documentacion = {
  id: 'd-1',
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 2 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};
const DOC_2: Documentacion = {
  id: 'd-2',
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
    expect(tabla().getByText('Laura Gómez')).toBeInTheDocument();
    expect(tabla().getByText('Carlos Ruiz')).toBeInTheDocument();
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
});
