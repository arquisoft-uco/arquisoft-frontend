import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import DarDeBajaUsuarioDialog from './DarDeBajaUsuarioDialog';
import { usuariosService } from '../../services/usuariosService';
import { toast } from '../../../../shared/hooks/useToast';
import type { Usuario } from '../../models/Usuario';

vi.mock('../../services/usuariosService', () => ({
  usuariosService: { eliminarUsuario: vi.fn() },
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const USUARIO: Usuario = {
  id: 'u-1',
  identificador: '2001',
  nombre: 'Marta Ríos',
  email: 'marta@uco.edu.co',
  contacto: '3001234567',
  estado: 'ACTIVO',
  vigente: true,
  esEstudiante: false,
  esAsesor: false,
  esAsesorFicha: false,
  esCoordinador: false,
  esRepresentanteComite: false,
  esAdministrador: false,
  esBibliotecario: false,
};

function renderizar() {
  const onCerrar = vi.fn();
  const onBajaExitosa = vi.fn();
  render(
    <DarDeBajaUsuarioDialog usuario={USUARIO} onCerrar={onCerrar} onBajaExitosa={onBajaExitosa} />,
  );
  return { onCerrar, onBajaExitosa };
}

describe('DarDeBajaUsuarioDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('abre nombrando al usuario con sus consecuencias y Cancelar lo cierra sin mutar', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar, onBajaExitosa } = renderizar();
    const dialogo = screen.getByRole('alertdialog', { name: `¿Dar de baja a ${USUARIO.nombre}?` });

    // Assert
    expect(
      within(dialogo).getByText(
        `Se desactivará el acceso de ${USUARIO.nombre} y dejará de estar vigente.`,
      ),
    ).toBeInTheDocument();
    expect(
      within(dialogo)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Solo se puede dar de baja a quien ya no tiene roles vigentes.',
      'Podrás restaurar al usuario desde la pestaña Acceso.',
    ]);

    // Act
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onBajaExitosa).not.toHaveBeenCalled();
    expect(usuariosService.eliminarUsuario).not.toHaveBeenCalled();
  });

  it('confirmar da de baja con el id, lanza toast.success y llama a onBajaExitosa y a onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.eliminarUsuario).mockResolvedValue(undefined);
    const { onCerrar, onBajaExitosa } = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar de baja' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(usuariosService.eliminarUsuario).toHaveBeenCalledWith(USUARIO.id);
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Usuario dado de baja',
      `${USUARIO.nombre} ya no está vigente.`,
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(onBajaExitosa).toHaveBeenCalledTimes(1);
  });

  it('en error lanza toast.error con el mensaje de respaldo y cierra sin llamar a onBajaExitosa', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.eliminarUsuario).mockRejectedValue(new Error('fallo'));
    const { onCerrar, onBajaExitosa } = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar de baja' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo dar de baja al usuario',
      'Inténtalo nuevamente.',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onBajaExitosa).not.toHaveBeenCalled();
  });

  it('con la mutación pendiente bloquea los botones y no cierra con Cancelar ni con Esc', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.eliminarUsuario).mockReturnValue(new Promise<void>(() => undefined));
    const { onCerrar } = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar de baja' }));
    const procesando = await screen.findByRole('button', { name: 'Procesando...' });
    const cancelar = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelar);
    await user.keyboard('{Escape}');

    // Assert
    expect(procesando).toBeDisabled();
    expect(cancelar).toBeDisabled();
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
