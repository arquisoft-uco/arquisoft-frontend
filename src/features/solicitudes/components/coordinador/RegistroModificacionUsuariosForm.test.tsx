import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import RegistroModificacionUsuariosForm from './RegistroModificacionUsuariosForm';
import { useEnviarSolicitudRegistroModificacionUsuarios } from '../../hooks/useEnviarSolicitudRegistroModificacionUsuarios';
import { useAdministradoresVigentes } from '../../../../shared/hooks/useAdministradoresVigentes';
import { toast } from '../../../../shared/hooks/useToast';

vi.mock('../../hooks/useEnviarSolicitudRegistroModificacionUsuarios', () => ({
  useEnviarSolicitudRegistroModificacionUsuarios: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useAdministradoresVigentes', () => ({
  useAdministradoresVigentes: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const UUID_VALIDO = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const OTRO_UUID = '9b2f4c1e-7a3d-4e58-8c61-2d5f0a9b7e14';
const MENSAJE_VALIDO = 'Necesito registrar un usuario.';
const PLACEHOLDER = 'Selecciona un administrador';

type Mutacion = ReturnType<typeof useEnviarSolicitudRegistroModificacionUsuarios>;
type Administradores = ReturnType<typeof useAdministradoresVigentes>;

function crearMutacionMock(mutate: Mutacion['mutate']): Mutacion {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as Mutacion;
}

function administrador(id: string, nombre: string, email: string) {
  return { id, identificador: '1', nombre, email, contacto: '3000000000', estado: 'ACTIVO' };
}

function simularAdministradores(parcial: Partial<Administradores>) {
  vi.mocked(useAdministradoresVigentes).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...parcial,
  } as Administradores);
}

function simularLista(...admins: ReturnType<typeof administrador>[]) {
  simularAdministradores({
    data: {
      content: admins,
      page: 0,
      size: 100,
      totalElements: admins.length,
      totalPages: 1,
      first: true,
      last: true,
      empty: admins.length === 0,
    },
  });
}

async function elegirAdministrador(user: ReturnType<typeof userEvent.setup>, id: string) {
  await user.selectOptions(screen.getByLabelText('Administrador'), id);
}

describe('RegistroModificacionUsuariosForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnviarSolicitudRegistroModificacionUsuarios).mockReturnValue(
      crearMutacionMock(mutate),
    );
    simularLista(
      administrador(UUID_VALIDO, 'Ana Pérez', 'ana@uco.edu.co'),
      administrador(OTRO_UUID, 'Luis Gómez', 'luis@uco.edu.co'),
    );
  });

  it('muestra los textos y el placeholder sin aviso de no disponible', () => {
    render(<RegistroModificacionUsuariosForm />);

    expect(
      screen.getByRole('heading', {
        name: 'Enviar solicitud de registro y modificación de usuarios',
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Administrador')).toHaveDisplayValue(PLACEHOLDER);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('la lista abierta solo trae los administradores, sin opción vacía ni placeholder', () => {
    render(<RegistroModificacionUsuariosForm />);

    const opciones = within(screen.getByLabelText('Administrador')).getAllByRole('option');

    expect(opciones.map((o) => o.textContent)).toEqual([
      'Ana Pérez (ana@uco.edu.co)',
      'Luis Gómez (luis@uco.edu.co)',
    ]);
    expect(screen.queryByRole('option', { name: PLACEHOLDER })).not.toBeInTheDocument();
    const placeholder = within(screen.getByLabelText('Administrador')).getByText(PLACEHOLDER);
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute('hidden');
    expect(placeholder).toHaveAttribute('value', '');
  });

  it('no preselecciona aunque haya un solo administrador', () => {
    simularLista(administrador(UUID_VALIDO, 'Ana Pérez', 'ana@uco.edu.co'));
    render(<RegistroModificacionUsuariosForm />);

    expect(screen.getByLabelText('Administrador')).toHaveDisplayValue(PLACEHOLDER);
  });

  it('al elegir un administrador muestra su etiqueta y envía su id tras confirmar', async () => {
    const user = userEvent.setup();
    render(<RegistroModificacionUsuariosForm />);

    await elegirAdministrador(user, OTRO_UUID);
    expect(screen.getByLabelText('Administrador')).toHaveDisplayValue(
      'Luis Gómez (luis@uco.edu.co)',
    );
    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Enviar' }));

    expect(mutate).toHaveBeenCalledWith(
      { destinatario: OTRO_UUID, mensajeSolicitud: MENSAJE_VALIDO },
      expect.anything(),
    );
  });

  it('sin elegir administrador no envía y muestra el mensaje de formato', async () => {
    const user = userEvent.setup();
    render(<RegistroModificacionUsuariosForm />);

    await user.click(screen.getByLabelText(/^Mensaje/));
    await user.paste(MENSAJE_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));

    expect(await screen.findByText('Identificador inválido')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('con administrador pero sin mensaje no envía y muestra los errores', async () => {
    const user = userEvent.setup();
    render(<RegistroModificacionUsuariosForm />);

    await elegirAdministrador(user, UUID_VALIDO);
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }));

    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('mientras carga deshabilita el select y muestra «Cargando administradores…»', () => {
    simularAdministradores({ isPending: true });
    render(<RegistroModificacionUsuariosForm />);

    const select = screen.getByLabelText('Administrador');
    expect(select).toBeDisabled();
    expect(select).toHaveDisplayValue('Cargando administradores…');
  });

  it('sin administradores vigentes lo indica y deshabilita el envío', () => {
    simularLista();
    render(<RegistroModificacionUsuariosForm />);

    const select = screen.getByLabelText('Administrador');
    expect(select).toBeDisabled();
    expect(select).toHaveDisplayValue('No hay administradores vigentes');
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  });

  it('si falla la carga avisa con un toast y deshabilita el select', () => {
    simularAdministradores({ isError: true, error: new Error('falló') });
    render(<RegistroModificacionUsuariosForm />);

    expect(screen.getByLabelText('Administrador')).toBeDisabled();
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudieron cargar los administradores',
      expect.any(String),
    );
  });
});
