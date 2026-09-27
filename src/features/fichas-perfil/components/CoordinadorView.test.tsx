import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import CoordinadorView from './CoordinadorView';

vi.mock('./coordinador/ConsultarFichasPerfilCoordinador', () => ({
  default: ({
    accionHeader,
    formulario,
  }: {
    accionHeader?: React.ReactNode;
    formulario?: React.ReactNode;
  }) => (
    <div>
      {accionHeader}
      {formulario}
    </div>
  ),
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
  it('abre el formulario al pulsar Nueva Ficha de Perfil, oculta el botón, y lo cierra devolviendo el botón', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CoordinadorView />);
    const abrir = screen.getByRole('button', { name: 'Nueva Ficha de Perfil' });
    expect(screen.queryByText('Formulario de registro')).not.toBeInTheDocument();

    // Act: abrir
    await user.click(abrir);

    // Assert: formulario visible, botón de apertura oculto
    expect(screen.getByText('Formulario de registro')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nueva Ficha de Perfil' })).not.toBeInTheDocument();

    // Act: cerrar
    await user.click(screen.getByRole('button', { name: 'Cerrar formulario' }));

    // Assert: vuelve el botón, se oculta el formulario
    expect(screen.getByRole('button', { name: 'Nueva Ficha de Perfil' })).toBeInTheDocument();
    expect(screen.queryByText('Formulario de registro')).not.toBeInTheDocument();
  });
});
