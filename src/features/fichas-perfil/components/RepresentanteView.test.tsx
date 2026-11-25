import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import RepresentanteView from './RepresentanteView';

vi.mock('./representante/ConsultarFichasDisponibles', () => ({
  default: () => <p>Listado de fichas disponibles</p>,
}));
vi.mock('./representante/ConsultarFichasParticipo', () => ({
  default: () => <p>Listado de fichas en las que participo</p>,
}));

describe('RepresentanteView', () => {
  it('muestra por defecto la pestaña «Disponibles para evaluar» con su listado', () => {
    // Act
    render(<RepresentanteView />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Fichas de perfil' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Disponibles para evaluar' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'En las que participo' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByText('Listado de fichas disponibles')).toBeInTheDocument();
    expect(screen.queryByText('Listado de fichas en las que participo')).not.toBeInTheDocument();
  });

  it('con ?vista=participo muestra el listado de participación', () => {
    // Act
    render(<RepresentanteView />, { initialPath: '/fichas-perfil?vista=participo' });

    // Assert
    expect(screen.getByRole('link', { name: 'En las que participo' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('Listado de fichas en las que participo')).toBeInTheDocument();
    expect(screen.queryByText('Listado de fichas disponibles')).not.toBeInTheDocument();
  });

  it('una vista desconocida cae en «Disponibles para evaluar»', () => {
    // Act
    render(<RepresentanteView />, { initialPath: '/fichas-perfil?vista=otra&q=sis' });

    // Assert
    expect(screen.getByRole('link', { name: 'Disponibles para evaluar' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('Listado de fichas disponibles')).toBeInTheDocument();
  });
});
