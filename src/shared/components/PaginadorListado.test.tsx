import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils/render';
import PaginadorListado from './PaginadorListado';

const propsBase = {
  page: 0,
  pageSize: 10,
  totalPages: 3,
  totalElements: 25,
  cantidadEnPagina: 10,
  etiquetaPlural: 'estudiantes',
  onPageChange: vi.fn(),
};

describe('PaginadorListado', () => {
  it('no renderiza nada cuando hay una sola página', () => {
    // Arrange
    const { container } = render(<PaginadorListado {...propsBase} totalPages={1} />);

    // Assert
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el rango y la página en primera página y en la última parcial', () => {
    // Arrange
    const { rerender } = render(<PaginadorListado {...propsBase} />);

    // Assert
    expect(screen.getByText('1–10 de 25 estudiantes')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Act
    rerender(<PaginadorListado {...propsBase} page={2} cantidadEnPagina={5} />);

    // Assert
    expect(screen.getByText('21–25 de 25 estudiantes')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('deshabilita Anterior en la primera página y Siguiente en la última', () => {
    // Arrange
    const { rerender } = render(<PaginadorListado {...propsBase} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();

    // Act
    rerender(<PaginadorListado {...propsBase} page={2} cantidadEnPagina={5} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  it('llama a onPageChange con la página anterior o siguiente al hacer clic', async () => {
    // Arrange
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<PaginadorListado {...propsBase} page={1} onPageChange={onPageChange} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(onPageChange).toHaveBeenNthCalledWith(1, 0);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });
});
