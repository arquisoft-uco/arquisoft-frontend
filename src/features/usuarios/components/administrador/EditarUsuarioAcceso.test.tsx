import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import EditarUsuarioAcceso from './EditarUsuarioAcceso';
import { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import { usuariosService } from '../../services/usuariosService';
import { toast } from '../../../../shared/hooks/useToast';
import { textosCambioEstado } from '../../utils/estados-usuario';
import type { EstadoUsuario } from '../../models/EstadoUsuario';
import type { Usuario } from '../../models/Usuario';

vi.mock('../../services/usuariosService', () => ({
  usuariosService: {
    getEstadosUsuario: vi.fn(),
    cambiarEstadoUsuario: vi.fn(),
    eliminarUsuario: vi.fn(),
  },
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const ACTIVO: EstadoUsuario = { id: 'ACTIVO', nombre: 'Activo', descripcion: 'Con acceso' };
const INACTIVO: EstadoUsuario = { id: 'INACTIVO', nombre: 'Inactivo', descripcion: 'Sin acceso' };
const ESTADOS = [ACTIVO, INACTIVO];

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

const USUARIO_DADO_DE_BAJA: Usuario = {
  ...USUARIO,
  id: 'u-2',
  identificador: '2002',
  nombre: 'Luis Pardo',
  email: 'luis@uco.edu.co',
  contacto: '3007654321',
  estado: 'INACTIVO',
  vigente: false,
};

function errorApi(status: number, data: Record<string, unknown>) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}

function diferida() {
  let resolver: () => void = () => undefined;
  let rechazar: (motivo: unknown) => void = () => undefined;
  const promesa = new Promise<void>((resolve, reject) => {
    resolver = resolve;
    rechazar = reject;
  });
  return { promesa, resolver, rechazar };
}

interface PropsAnfitrion {
  usuario: Usuario;
  onCerrarPanel: () => void;
}

// El panel recibe el resultado de useEstadosUsuario: se monta con el hook real sobre el service mockeado.
function Anfitrion({ usuario, onCerrarPanel }: PropsAnfitrion) {
  const estados = useEstadosUsuario();
  return <EditarUsuarioAcceso usuario={usuario} estados={estados} onCerrarPanel={onCerrarPanel} />;
}

function renderizar(usuario: Usuario = USUARIO) {
  const onCerrarPanel = vi.fn();
  render(<Anfitrion usuario={usuario} onCerrarPanel={onCerrarPanel} />);
  return { onCerrarPanel };
}

describe('EditarUsuarioAcceso', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(usuariosService.getEstadosUsuario).mockResolvedValue(ESTADOS);
  });

  it('elegir otro estado habilita "Aplicar cambio de estado", abre la confirmación con la frase del cambio y confirmar cambia el estado, avisa y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.cambiarEstadoUsuario).mockResolvedValue(undefined);
    const textos = textosCambioEstado(USUARIO, INACTIVO, ESTADOS);
    const { onCerrarPanel } = renderizar();
    const aplicar = screen.getByRole('button', { name: 'Aplicar cambio de estado' });

    // Assert
    expect(await screen.findByRole('radio', { name: ACTIVO.nombre })).toBeChecked();
    expect(aplicar).toBeDisabled();

    // Act
    await user.click(screen.getByRole('radio', { name: INACTIVO.nombre }));

    // Assert
    expect(aplicar).toBeEnabled();

    // Act
    await user.click(aplicar);

    // Assert
    const dialogo = screen.getByRole('dialog', { name: textos.titulo });
    expect(within(dialogo).getByText(textos.descripcion)).toBeInTheDocument();

    // Act
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(usuariosService.cambiarEstadoUsuario).not.toHaveBeenCalled();

    // Act
    await user.click(aplicar);
    await user.click(screen.getByRole('button', { name: textos.labelConfirmar }));

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(usuariosService.cambiarEstadoUsuario).toHaveBeenCalledTimes(1);
    expect(usuariosService.cambiarEstadoUsuario).toHaveBeenCalledWith(USUARIO.id, {
      estado: 'INACTIVO',
    });
    expect(toast.success).toHaveBeenCalledWith(textos.exito.titulo, textos.exito.mensaje);
    expect(onCerrarPanel).toHaveBeenCalledTimes(1);
  });

  it('mientras cambia el estado bloquea el diálogo y, si falla, avisa con toast.error y no cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const cambio = diferida();
    vi.mocked(usuariosService.cambiarEstadoUsuario).mockReturnValue(cambio.promesa);
    const textos = textosCambioEstado(USUARIO, INACTIVO, ESTADOS);
    const { onCerrarPanel } = renderizar();
    await user.click(await screen.findByRole('radio', { name: INACTIVO.nombre }));
    await user.click(screen.getByRole('button', { name: 'Aplicar cambio de estado' }));

    // Act
    await user.click(screen.getByRole('button', { name: textos.labelConfirmar }));

    // Assert
    expect(await screen.findByRole('button', { name: 'Procesando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Aplicar cambio de estado' })).toBeDisabled();

    // Act
    cambio.rechazar(errorApi(422, { message: 'Transición no permitida' }));

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(toast.error).toHaveBeenCalledWith(textos.error, 'Transición no permitida');
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrarPanel).not.toHaveBeenCalled();
  });

  it('mientras llega el catálogo muestra el esqueleto, deshabilita "Aplicar cambio de estado" y deja disponible la baja', () => {
    // Arrange
    vi.mocked(usuariosService.getEstadosUsuario).mockReturnValue(
      new Promise<EstadoUsuario[]>(() => undefined),
    );

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados de la cuenta…');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar cambio de estado' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Dar de baja…' })).toBeEnabled();
  });

  it('con el catálogo caído muestra el aviso y deshabilita "Aplicar cambio de estado" y "Restaurar usuario"', async () => {
    // Arrange
    vi.mocked(usuariosService.getEstadosUsuario).mockRejectedValue(new Error('500'));

    // Act
    renderizar(USUARIO_DADO_DE_BAJA);

    // Assert
    expect(
      await screen.findByRole('note', { name: 'No disponible: estados de usuario' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar cambio de estado' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Restaurar usuario' })).toBeDisabled();
  });

  it('"Dar de baja…" abre la confirmación y confirmar da de baja al usuario, avisa y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.eliminarUsuario).mockResolvedValue(undefined);
    const { onCerrarPanel } = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar de baja…' }));

    // Assert
    expect(
      screen.getByRole('alertdialog', { name: `¿Dar de baja a ${USUARIO.nombre}?` }),
    ).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Dar de baja' }));

    // Assert
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(usuariosService.eliminarUsuario).toHaveBeenCalledWith(USUARIO.id);
    expect(toast.success).toHaveBeenCalledWith(
      'Usuario dado de baja',
      `${USUARIO.nombre} ya no está vigente.`,
    );
    expect(onCerrarPanel).toHaveBeenCalledTimes(1);
  });

  it('a un usuario dado de baja se le ofrece "Restaurar usuario" y no "Dar de baja…", y restaurar confirma y aplica ACTIVO', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.cambiarEstadoUsuario).mockResolvedValue(undefined);
    const textos = textosCambioEstado(USUARIO_DADO_DE_BAJA, ACTIVO, ESTADOS);
    const { onCerrarPanel } = renderizar(USUARIO_DADO_DE_BAJA);
    await screen.findByRole('radio', { name: INACTIVO.nombre });

    // Assert
    expect(
      screen.getByText('Este usuario está dado de baja y no puede iniciar sesión.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dar de baja…' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Restaurar usuario' }));

    // Assert
    const dialogo = screen.getByRole('dialog', { name: textos.titulo });
    expect(dialogo).toHaveTextContent('El usuario será restaurado.');

    // Act
    await user.click(within(dialogo).getByRole('button', { name: textos.labelConfirmar }));

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(usuariosService.cambiarEstadoUsuario).toHaveBeenCalledWith(USUARIO_DADO_DE_BAJA.id, {
      estado: 'ACTIVO',
    });
    expect(toast.success).toHaveBeenCalledWith(textos.exito.titulo, textos.exito.mensaje);
    expect(onCerrarPanel).toHaveBeenCalledTimes(1);
  });
});
