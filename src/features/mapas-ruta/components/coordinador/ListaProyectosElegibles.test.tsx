import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ListaProyectosElegibles from './ListaProyectosElegibles';

const propsBase = {
  opciones: [
    { id: 'p-1', etiqueta: 'Sistema de monitoreo' },
    { id: 'p-2', etiqueta: 'Plataforma web' },
    { id: 'p-3', etiqueta: 'Gestión académica' },
  ],
  valor: '',
  onCambiar: vi.fn(),
  hayMas: false,
  cargandoMas: false,
  onCargarMas: vi.fn(),
};

describe('ListaProyectosElegibles', () => {
  it('muestra las opciones como radios de base y avisa el id al elegir una', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCambiar = vi.fn();
    render(<ListaProyectosElegibles {...propsBase} onCambiar={onCambiar} />);

    // Act
    await user.click(screen.getByRole('radio', { name: 'Plataforma web' }));

    // Assert
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(onCambiar).toHaveBeenCalledWith('p-2');
  });

  it('filtra sin distinguir mayúsculas ni tildes y conserva la opción elegida', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ListaProyectosElegibles {...propsBase} valor="p-1" />);

    // Act
    await user.type(screen.getByPlaceholderText('Busca por título'), 'GESTION');

    // Assert
    expect(screen.getByRole('radio', { name: 'Gestión académica' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sistema de monitoreo' })).toBeChecked();
    expect(screen.queryByRole('radio', { name: 'Plataforma web' })).toBeNull();
  });

  it('sin coincidencias avisa y «Cargar más proyectos» sigue disponible', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCargarMas = vi.fn();
    render(<ListaProyectosElegibles {...propsBase} hayMas onCargarMas={onCargarMas} />);

    // Act
    await user.type(screen.getByPlaceholderText('Busca por título'), 'zzz');
    await user.click(screen.getByRole('button', { name: /Cargar más proyectos/ }));

    // Assert
    expect(screen.getByText('No hay proyectos que coincidan.')).toBeInTheDocument();
    expect(onCargarMas).toHaveBeenCalledTimes(1);
  });

  it('sin más páginas no ofrece «Cargar más proyectos»', () => {
    // Arrange / Act
    render(<ListaProyectosElegibles {...propsBase} />);

    // Assert
    expect(screen.queryByRole('button', { name: /Cargar más proyectos/ })).toBeNull();
  });

  it('Enter en el buscador no envía el formulario que lo contiene', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn((evento: { preventDefault: () => void }) => evento.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ListaProyectosElegibles {...propsBase} />
        <button type="submit">Enviar</button>
      </form>,
    );

    // Act
    await user.type(screen.getByPlaceholderText('Busca por título'), 'web{Enter}');

    // Assert
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
