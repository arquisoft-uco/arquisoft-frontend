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

describe('RevisionesFichaTabla', () => {
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
