import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import RepresentanteView from './RepresentanteView';

vi.mock('./representante/ConsultarFichasRepresentante', () => ({
  default: () => <p>Listado de fichas a evaluar</p>,
}));

describe('RepresentanteView', () => {
  it('muestra el título de la página con el listado', () => {
    // Act
    render(<RepresentanteView />);

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Fichas de perfil a evaluar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Listado de fichas a evaluar')).toBeInTheDocument();
  });
});
