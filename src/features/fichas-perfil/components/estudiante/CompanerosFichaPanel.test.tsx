import { describe, it, expect } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import CompanerosFichaPanel from './CompanerosFichaPanel';

describe('CompanerosFichaPanel', () => {
  it('lista a cada integrante con su nombre y su correo', () => {
    // Arrange
    const integrantes = [
      { id: 'e-1', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' },
      { id: 'e-2', nombre: 'Marta Gómez', email: 'marta@uco.edu.co' },
    ];

    // Act
    render(<CompanerosFichaPanel integrantes={integrantes} />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Equipo de la ficha' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(2);
    expect(within(lista).getByText('Luis Pérez')).toBeInTheDocument();
    expect(within(lista).getByText('marta@uco.edu.co')).toBeInTheDocument();
  });

  it('sin integrantes muestra una línea compacta y no una lista', () => {
    // Act
    render(<CompanerosFichaPanel integrantes={[]} />);

    // Assert
    expect(screen.getByText('Aún no hay integrantes registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
