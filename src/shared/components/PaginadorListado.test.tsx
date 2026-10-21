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
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();

    // Act
    rerender(<PaginadorListado {...propsBase} page={2} cantidadEnPagina={5} />);

    // Assert
    expect(screen.getByText('21–25 de 25 estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Página 3 de 3')).toBeInTheDocument();
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

  describe('números de página', () => {
    const botonesNumericos = () => screen.getAllByRole('button', { name: /^Página \d+$/ });
    const etiquetasNumericas = () => botonesNumericos().map((boton) => boton.textContent);

    it('con muchas páginas muestra la primera, la última y la vecindad de la actual entre puntos suspensivos', () => {
      // Act
      render(<PaginadorListado {...propsBase} page={4} totalPages={10} totalElements={98} />);

      // Assert
      expect(etiquetasNumericas()).toEqual(['1', '4', '5', '6', '10']);
      expect(screen.getAllByText('…')).toHaveLength(2);
      expect(screen.getByRole('button', { name: 'Página 5' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getByRole('button', { name: 'Página 4' })).not.toHaveAttribute('aria-current');
      expect(screen.getByText('Página 5 de 10')).toBeInTheDocument();
    });

    it('al pulsar un número llama a onPageChange con la página base cero', async () => {
      // Arrange
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(
        <PaginadorListado
          {...propsBase}
          page={4}
          totalPages={10}
          totalElements={98}
          onPageChange={onPageChange}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: 'Página 6' }));
      await user.click(screen.getByRole('button', { name: 'Página 10' }));

      // Assert
      expect(onPageChange).toHaveBeenNthCalledWith(1, 5);
      expect(onPageChange).toHaveBeenNthCalledWith(2, 9);
    });

    it('en el inicio y en el final deja un solo grupo de puntos suspensivos', () => {
      // Arrange
      const { rerender } = render(
        <PaginadorListado {...propsBase} page={1} totalPages={10} totalElements={98} />,
      );

      // Assert
      expect(etiquetasNumericas()).toEqual(['1', '2', '3', '4', '5', '10']);
      expect(screen.getAllByText('…')).toHaveLength(1);

      // Act
      rerender(<PaginadorListado {...propsBase} page={8} totalPages={10} totalElements={98} />);

      // Assert
      expect(etiquetasNumericas()).toEqual(['1', '6', '7', '8', '9', '10']);
      expect(screen.getAllByText('…')).toHaveLength(1);
      expect(screen.getByRole('button', { name: 'Página 9' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('con siete páginas o menos las muestra todas, sin puntos suspensivos', () => {
      // Act
      render(<PaginadorListado {...propsBase} page={3} totalPages={7} totalElements={68} />);

      // Assert
      expect(etiquetasNumericas()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
      expect(screen.queryByText('…')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Página 4' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });
});
