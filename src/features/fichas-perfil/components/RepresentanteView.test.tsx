import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import RepresentanteView from './RepresentanteView';

vi.mock('./representante/ConsultarFichasDisponibles', () => ({
  default: () => <p>Listado de fichas disponibles</p>,
}));

describe('RepresentanteView', () => {
  it('muestra el título de la página con el listado', () => {
    // Act
    render(<RepresentanteView />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Fichas de perfil' })).toBeInTheDocument();
    expect(screen.getByText('Listado de fichas disponibles')).toBeInTheDocument();
  });
});
