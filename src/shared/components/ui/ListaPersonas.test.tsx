import { describe, it, expect } from 'vitest';
import { render, screen, within } from '../../../test-utils/render';
import ListaPersonas, { type PersonaListada } from './ListaPersonas';

const PERSONAS: PersonaListada[] = [
  { id: '1', nombre: 'Luis Gómez', email: 'luis@uco.edu.co', identificador: '2001', vigente: true },
  { id: '2', nombre: 'Ana Pérez', email: 'ana@uco.edu.co', vigente: false },
  { id: '3', nombre: 'Sara Ruiz', email: 'sara@uco.edu.co' },
];

describe('ListaPersonas', () => {
  it('lista nombre, correo e identificador y marca solo a quien es no vigente', () => {
    // Act
    render(<ListaPersonas personas={PERSONAS} etiqueta="Personas" />);

    // Assert
    const items = within(screen.getByRole('list', { name: 'Personas' })).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText('2001')).toBeInTheDocument();
    expect(within(items[0]).getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(within(items[0]).queryByText('No vigente')).toBeNull();
    expect(within(items[1]).getByText('No vigente')).toBeInTheDocument();
    expect(within(items[2]).queryByText('No vigente')).toBeNull();
  });

  it('renderiza la acción en cada fila y sin ella no hay botones', () => {
    // Act
    const { rerender } = render(
      <ListaPersonas
        personas={PERSONAS}
        etiqueta="Personas"
        accion={(p) => <button type="button">Acción {p.nombre}</button>}
      />,
    );

    // Assert
    expect(screen.getAllByRole('button')).toHaveLength(3);
    rerender(<ListaPersonas personas={PERSONAS} etiqueta="Personas" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
