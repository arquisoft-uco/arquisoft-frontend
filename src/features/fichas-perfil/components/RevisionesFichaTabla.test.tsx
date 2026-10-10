import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import RevisionesFichaTabla from './RevisionesFichaTabla';

const BASE = {
  filas: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  pageSize: 10,
  goToPage: vi.fn(),
  direccion: undefined,
  ordenar: vi.fn(),
  sinItems: false,
  isLoading: false,
  isError: false,
  error: null,
  reintentar: vi.fn(),
  tituloVacio: 'Sin revisiones de prueba',
  descripcionVacia: 'Descripción de vacío de prueba.',
};

const FILA = {
  revision: {
    id: 'r-1',
    itemId: 'i-1',
    estadoId: 'NUEVA',
    estadoNombre: 'Nueva',
    fechaCreacion: '2026-09-01T10:00:00Z',
  },
  item: {
    id: 'i-1',
    fichaPerfilId: 'f-1',
    tipoItem: { id: 't-1', nombre: 'Objetivo general' },
    contenido: 'Medir el impacto',
  },
};

describe('RevisionesFichaTabla', () => {
  it('con la prop acciones pinta lo que devuelve por cada fila y sin ella no pinta botones', () => {
    // Arrange
    const acciones = vi.fn(() => <button type="button">Acción de prueba</button>);
    const props = { ...BASE, filas: [FILA], totalElements: 1, totalPages: 1 };
    const { unmount } = render(<RevisionesFichaTabla {...props} acciones={acciones} />);

    // Assert
    expect(acciones).toHaveBeenCalledWith(FILA);
    expect(screen.getAllByRole('button', { name: 'Acción de prueba' }).length).toBeGreaterThan(0);

    // Act
    unmount();
    render(<RevisionesFichaTabla {...props} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Acción de prueba' })).not.toBeInTheDocument();
  });

  it('con la consulta vacía y ítems presentes muestra el título y la descripción recibidos', () => {
    // Act
    render(<RevisionesFichaTabla {...BASE} />);

    // Assert
    expect(screen.getByText('Sin revisiones de prueba')).toBeInTheDocument();
    expect(screen.getByText('Descripción de vacío de prueba.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('el error tiene prioridad sobre la carga y usa el mensaje de respaldo sin detalle del backend', () => {
    // Act
    render(<RevisionesFichaTabla {...BASE} isError isLoading />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las revisiones');
    expect(screen.getByText('No se pudieron cargar las revisiones.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
