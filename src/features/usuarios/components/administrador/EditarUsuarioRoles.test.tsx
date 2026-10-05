import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import EditarUsuarioRoles from './EditarUsuarioRoles';
import { usuariosService } from '../../services/usuariosService';
import { toast } from '../../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import type { Usuario } from '../../models/Usuario';
import { errorApi } from '../../../../test-utils/errores-api';
import { diferida } from '../../../../test-utils/promesas';

vi.mock('../../services/usuariosService', () => ({
  usuariosService: {
    agregarRol: vi.fn(),
    removerCoordinador: vi.fn(),
    removerEstudiante: vi.fn(),
    removerAsesor: vi.fn(),
    removerAsesorFicha: vi.fn(),
    removerRepresentanteComite: vi.fn(),
    removerAdministrador: vi.fn(),
  },
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
  esEstudiante: true,
  esAsesor: false,
  esAsesorFicha: false,
  esCoordinador: true,
  esRepresentanteComite: false,
  esAdministrador: false,
  esBibliotecario: true,
};

const ROLES_ENCENDIDOS = [Rol.Estudiante, Rol.Coordinador, Rol.Bibliotecario];
const ROLES_APAGADOS = [
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
  Rol.Jurado,
];
const ROLES_CAMBIABLES = [
  Rol.Estudiante,
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.Coordinador,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
];

const interruptor = (rol: Rol) => screen.getByRole('switch', { name: ETIQUETAS_ROL[rol] });

describe('EditarUsuarioRoles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('muestra un interruptor por rol marcado según el usuario, con Jurado y Bibliotecario deshabilitados y "Pronto"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EditarUsuarioRoles usuario={USUARIO} />);

    // Assert
    expect(screen.getAllByRole('switch')).toHaveLength(8);
    for (const rol of ROLES_ENCENDIDOS) expect(interruptor(rol)).toBeChecked();
    for (const rol of ROLES_APAGADOS) expect(interruptor(rol)).not.toBeChecked();
    for (const rol of ROLES_CAMBIABLES) expect(interruptor(rol)).toBeEnabled();
    expect(interruptor(Rol.Jurado)).toBeDisabled();
    expect(interruptor(Rol.Bibliotecario)).toBeDisabled();
    expect(screen.getAllByText('Pronto')).toHaveLength(2);
    expect(interruptor(Rol.Jurado)).toHaveAccessibleDescription(/Pronto/);
    expect(interruptor(Rol.Bibliotecario)).toHaveAccessibleDescription(/Pronto/);

    // Act
    await user.click(interruptor(Rol.Jurado));
    await user.click(interruptor(Rol.Bibliotecario));

    // Assert
    expect(usuariosService.agregarRol).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('encender un rol llama al service con el id y el rol, avisa el éxito y deja el interruptor encendido', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.agregarRol).mockResolvedValue(undefined);
    render(<EditarUsuarioRoles usuario={USUARIO} />);

    // Act
    await user.click(interruptor(Rol.Asesor));

    // Assert
    expect(
      await screen.findByRole('switch', {
        name: ETIQUETAS_ROL[Rol.Asesor],
        checked: true,
        busy: false,
      }),
    ).toBeEnabled();
    expect(usuariosService.agregarRol).toHaveBeenCalledWith(USUARIO.id, Rol.Asesor);
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      `Se agregó el rol ${ETIQUETAS_ROL[Rol.Asesor]} a ${USUARIO.nombre}.`,
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('si agregar falla avisa con toast.error y el interruptor queda apagado', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.agregarRol).mockRejectedValue(
      errorApi(422, { message: 'Ya tiene ese rol' }),
    );
    render(<EditarUsuarioRoles usuario={USUARIO} />);

    // Act
    await user.click(interruptor(Rol.Asesor));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('No se pudo agregar el rol', 'Ya tiene ese rol'),
    );
    expect(
      await screen.findByRole('switch', {
        name: ETIQUETAS_ROL[Rol.Asesor],
        checked: false,
        busy: false,
      }),
    ).toBeEnabled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('apagar un rol abre la confirmación con sus consecuencias y el foco en "Cancelar"; cancelar no quita nada y confirmar quita el rol', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.removerEstudiante).mockResolvedValue(undefined);
    const rol = ETIQUETAS_ROL[Rol.Estudiante];
    render(<EditarUsuarioRoles usuario={USUARIO} />);

    // Act
    await user.click(interruptor(Rol.Estudiante));

    // Assert
    const dialogo = screen.getByRole('alertdialog', {
      name: `¿Quitar el rol ${rol} a ${USUARIO.nombre}?`,
    });
    expect(
      within(dialogo).getByText(`${USUARIO.nombre} dejará de tener el rol ${rol}.`),
    ).toBeInTheDocument();
    expect(
      within(dialogo)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Dejará de tener acceso a lo que ese rol permite.',
      'Puedes volver a asignárselo cuando quieras.',
    ]);
    expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    // Act
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(usuariosService.removerEstudiante).not.toHaveBeenCalled();
    expect(interruptor(Rol.Estudiante)).toBeChecked();
    expect(interruptor(Rol.Estudiante)).toHaveFocus();

    // Act
    await user.click(interruptor(Rol.Estudiante));
    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    // Assert
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(usuariosService.removerEstudiante).toHaveBeenCalledTimes(1);
    expect(usuariosService.removerEstudiante).toHaveBeenCalledWith(USUARIO.id);
    expect(interruptor(Rol.Estudiante)).not.toBeChecked();
    expect(toast.success).toHaveBeenCalledWith(
      'Rol quitado',
      `${USUARIO.nombre} ya no es ${rol.toLowerCase()}.`,
    );
  });

  it('mientras se quita el rol bloquea el diálogo y marca el interruptor ocupado, y si falla avisa y el interruptor sigue encendido', async () => {
    // Arrange
    const user = userEvent.setup();
    const quitar = diferida();
    vi.mocked(usuariosService.removerEstudiante).mockReturnValue(quitar.promesa);
    render(<EditarUsuarioRoles usuario={USUARIO} />);
    await user.click(interruptor(Rol.Estudiante));

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    // Assert
    expect(await screen.findByRole('button', { name: 'Procesando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(interruptor(Rol.Estudiante)).toHaveAttribute('aria-busy', 'true');

    // Act
    quitar.rechazar(errorApi(422, { message: 'No se puede quitar este rol' }));

    // Assert
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo quitar el rol',
      'No se puede quitar este rol',
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(interruptor(Rol.Estudiante)).toBeChecked();
    expect(interruptor(Rol.Estudiante)).not.toHaveAttribute('aria-busy');
  });

  it('solo el interruptor de la mutación en curso queda ocupado, y dos roles encendidos seguidos conservan cada marca y cada aviso', async () => {
    // Arrange
    const user = userEvent.setup();
    const asesor = diferida();
    const administrador = diferida();
    vi.mocked(usuariosService.agregarRol).mockImplementation((_usuarioId, rol) =>
      rol === Rol.Asesor ? asesor.promesa : administrador.promesa,
    );
    render(<EditarUsuarioRoles usuario={USUARIO} />);

    // Act
    await user.click(interruptor(Rol.Asesor));

    // Assert
    await screen.findByRole('switch', { name: ETIQUETAS_ROL[Rol.Asesor], busy: true });
    expect(screen.getAllByRole('switch', { busy: true })).toHaveLength(1);

    // Act
    await user.click(interruptor(Rol.Administrador));

    // Assert
    await screen.findByRole('switch', { name: ETIQUETAS_ROL[Rol.Administrador], busy: true });
    expect(screen.getAllByRole('switch', { busy: true })).toHaveLength(2);

    // Act
    asesor.resolver();
    administrador.resolver();

    // Assert
    await waitFor(() => expect(screen.queryAllByRole('switch', { busy: true })).toHaveLength(0));
    expect(interruptor(Rol.Asesor)).toBeChecked();
    expect(interruptor(Rol.Administrador)).toBeChecked();
    expect(toast.success).toHaveBeenCalledTimes(2);
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      `Se agregó el rol ${ETIQUETAS_ROL[Rol.Asesor]} a ${USUARIO.nombre}.`,
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      `Se agregó el rol ${ETIQUETAS_ROL[Rol.Administrador]} a ${USUARIO.nombre}.`,
    );
  });
});
