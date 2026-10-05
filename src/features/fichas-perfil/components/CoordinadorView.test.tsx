import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import CoordinadorView from './CoordinadorView';

vi.mock('./coordinador/ConsultarFichasPerfilCoordinador', () => ({
  default: () => <p>Listado de fichas</p>,
}));
vi.mock('./RegistrarFichaPerfil', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <div>
      <p>Formulario de registro</p>
      <button type="button" onClick={onCerrar}>
        Cerrar formulario
      </button>
    </div>
  ),
}));

describe('CoordinadorView', () => {
  it('muestra el título de la página y el listado', () => {
    // Act
    render(<CoordinadorView />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Fichas de perfil' })).toBeInTheDocument();
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
  });

  it('abre el formulario al pulsar Nueva ficha de perfil, oculta el botón, y lo cierra devolviendo el botón', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CoordinadorView />);
    expect(screen.queryByText('Formulario de registro')).not.toBeInTheDocument();

    // Act: abrir
    await user.click(screen.getByRole('button', { name: 'Nueva ficha de perfil' }));

    // Assert: formulario visible, botón de apertura oculto
    expect(screen.getByText('Formulario de registro')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nueva ficha de perfil' })).not.toBeInTheDocument();

    // Act: cerrar
    await user.click(screen.getByRole('button', { name: 'Cerrar formulario' }));

    // Assert: vuelve el botón, se oculta el formulario
    expect(screen.getByRole('button', { name: 'Nueva ficha de perfil' })).toBeInTheDocument();
    expect(screen.queryByText('Formulario de registro')).not.toBeInTheDocument();
  });
});
