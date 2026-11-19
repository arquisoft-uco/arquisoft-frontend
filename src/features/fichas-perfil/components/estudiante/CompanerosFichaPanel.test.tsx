import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import CompanerosFichaPanel from './CompanerosFichaPanel';
import { fichasPerfilService } from '../../services/fichasPerfilService';

vi.mock('../../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarCompanerosFichaPerfil: vi.fn() },
}));

const consultar = vi.mocked(fichasPerfilService.consultarCompanerosFichaPerfil);

const COMPANEROS = [
  { idVinculo: 'v-1', id: 'e-1', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' },
  { idVinculo: 'v-2', id: 'e-2', nombre: 'Marta Gómez', email: 'marta@uco.edu.co' },
];

describe('CompanerosFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista a cada compañero de la ficha con su nombre y su correo', async () => {
    // Arrange
    consultar.mockResolvedValue(COMPANEROS);

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    const lista = await screen.findByRole('list', { name: 'Compañeros' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(2);
    expect(within(lista).getByText('Luis Pérez')).toBeInTheDocument();
    expect(within(lista).getByText('marta@uco.edu.co')).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledWith('f-1');
  });

  it('mientras consulta muestra la carga y no la lista', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => {}));

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('sin compañeros muestra una línea de texto, sin alerta ni lista', async () => {
    // Arrange
    consultar.mockResolvedValue([]);

    // Act
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);

    // Assert
    expect(
      await screen.findByText('No tienes compañeros vinculados a esta ficha.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValue(new Error('fallo'));
    render(<CompanerosFichaPanel idFichaPerfil="f-1" />);
    const alerta = await screen.findByRole('alert');

    // Act
    await user.click(within(alerta).getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(alerta).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });
});
