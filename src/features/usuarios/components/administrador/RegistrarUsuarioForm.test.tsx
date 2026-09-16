import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import RegistrarUsuarioForm from './RegistrarUsuarioForm';
import { useRegistrarUsuario } from '../../hooks/useRegistrarUsuario';
import { toast } from '../../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';

vi.mock('../../hooks/useRegistrarUsuario', () => ({
  useRegistrarUsuario: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type MutacionRegistrarUsuario = ReturnType<typeof useRegistrarUsuario>;

function crearMutacionMock(
  mutate: ReturnType<typeof vi.fn>,
  isPending = false,
): MutacionRegistrarUsuario {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: isPending ? 'pending' : 'idle',
    isError: false,
    isIdle: !isPending,
    isPending,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as MutacionRegistrarUsuario;
}

const datosValidos = {
  identificador: '1234567890',
  nombres: 'Juan Camilo',
  apellidos: 'Pérez Gómez',
  email: 'juan.perez@uco.edu.co',
  contacto: '3001234567',
};

async function llenarFormularioValido() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/identificador/i), datosValidos.identificador);
  await user.type(screen.getByLabelText(/^nombres/i), datosValidos.nombres);
  await user.type(screen.getByLabelText(/^apellidos/i), datosValidos.apellidos);
  await user.type(screen.getByLabelText(/correo electrónico/i), datosValidos.email);
  await user.type(screen.getByLabelText(/contacto/i), datosValidos.contacto);
  return user;
}

describe('RegistrarUsuarioForm', () => {
  const onCerrar = vi.fn();
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    vi.mocked(useRegistrarUsuario).mockReturnValue(crearMutacionMock(mockMutate));
  });

  it('renderiza los campos obligatorios y el grupo de roles', () => {
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);

    expect(screen.getByLabelText(/identificador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nombres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^apellidos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contacto/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /roles a asignar/i })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Administrador] }),
    ).toBeInTheDocument();
  });

  it('mantiene el submit deshabilitado con datos vacíos, con contacto no numérico o con el nombre completo fuera de rango', async () => {
    const user = userEvent.setup();
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);
    const submit = screen.getByRole('button', { name: /registrar/i });

    expect(submit).toBeDisabled();

    await llenarFormularioValido();
    await user.clear(screen.getByLabelText(/contacto/i));
    await user.type(screen.getByLabelText(/contacto/i), 'abc1234567');
    expect(submit).toBeDisabled();

    await user.clear(screen.getByLabelText(/contacto/i));
    await user.type(screen.getByLabelText(/contacto/i), datosValidos.contacto);
    await user.clear(screen.getByLabelText(/^nombres/i));
    await user.type(screen.getByLabelText(/^nombres/i), 'a'.repeat(40));
    await user.clear(screen.getByLabelText(/^apellidos/i));
    await user.type(screen.getByLabelText(/^apellidos/i), 'b'.repeat(20));
    expect(submit).toBeDisabled();

    expect(mockMutate).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('pinta el error de longitud total en nombres y apellidos cuando la suma excede 50 pero cada uno tiene formato válido', async () => {
    const user = userEvent.setup();
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);

    await user.type(screen.getByLabelText(/^nombres/i), 'a'.repeat(40));
    await user.type(screen.getByLabelText(/^apellidos/i), 'b'.repeat(20));
    await user.click(document.body);

    const alertas = await screen.findAllByRole('alert');
    const mensajes = alertas.map((a) => a.textContent);
    expect(mensajes.filter((m) => /entre 2 y 50/.test(m ?? ''))).toHaveLength(2);
    expect(screen.getByLabelText(/^nombres/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/^apellidos/i)).toHaveAttribute('aria-invalid', 'true');
  });

  // Cubre el fix de `register(..., { deps: ... })`: nombres y apellidos se revalidan entre sí,
  // así que corregir solo uno de los dos limpia el error compuesto en ambos inputs.
  it('al corregir solo uno de los dos campos, el error de longitud total desaparece de ambos', async () => {
    const user = userEvent.setup();
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);

    await user.type(screen.getByLabelText(/^nombres/i), 'a'.repeat(40));
    await user.type(screen.getByLabelText(/^apellidos/i), 'b'.repeat(20));
    expect(await screen.findAllByText('Debe tener entre 2 y 50 caracteres')).toHaveLength(2);

    await user.clear(screen.getByLabelText(/^apellidos/i));
    await user.type(screen.getByLabelText(/^apellidos/i), 'b'.repeat(5));

    expect(screen.queryByText('Debe tener entre 2 y 50 caracteres')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^nombres/i)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/^apellidos/i)).toHaveAttribute('aria-invalid', 'false');
  });

  it('pinta el error de formato solo en el input culpable cuando nombres tiene un carácter inválido y apellidos es válido', async () => {
    const user = userEvent.setup();
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);

    await user.type(screen.getByLabelText(/^nombres/i), 'Juan1');
    await user.type(screen.getByLabelText(/^apellidos/i), 'Pérez');
    await user.click(document.body);

    expect(await screen.findByText('Solo letras y espacios')).toBeInTheDocument();
    expect(screen.getByLabelText(/^nombres/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/^apellidos/i)).toHaveAttribute('aria-invalid', 'false');
  });

  it('con datos válidos habilita el submit y envía el payload correcto incluyendo los roles marcados', async () => {
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);
    const user = await llenarFormularioValido();

    await user.click(screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] }));

    const submit = screen.getByRole('button', { name: /registrar/i });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(mockMutate).toHaveBeenCalledWith(
      {
        identificador: datosValidos.identificador,
        nombres: datosValidos.nombres,
        apellidos: datosValidos.apellidos,
        email: datosValidos.email,
        contacto: datosValidos.contacto,
        roles: [Rol.Coordinador],
      },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('en éxito muestra el toast de éxito y cierra el formulario con onCerrar', async () => {
    mockMutate.mockImplementation((_valores, options) => {
      options.onSuccess();
    });
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);
    const user = await llenarFormularioValido();

    await user.click(screen.getByRole('button', { name: /registrar/i }));

    expect(toast.success).toHaveBeenCalledWith(
      'Usuario registrado',
      expect.stringContaining(`${datosValidos.nombres} ${datosValidos.apellidos}`),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['USUARIO_IDENTIFICADOR_DUPLICADO', /identificador/i, 'Ya existe un usuario con este identificador.'],
    ['USUARIO_EMAIL_DUPLICADO', /correo electrónico/i, 'Ya existe un usuario con este correo.'],
    ['USUARIO_CONTACTO_DUPLICADO', /^contacto/i, 'Ya existe un usuario con este contacto.'],
  ])(
    'en un 422 de duplicado por %s muestra toast.error y el error en el campo, sin cerrar el formulario',
    async (errorCode, etiquetaCampo, mensajeEsperado) => {
      const error = {
        isAxiosError: true,
        response: {
          status: 422,
          data: { error: 'Conflict', errorCode, message: mensajeEsperado, status: 422 },
        },
      };
      mockMutate.mockImplementation((_valores, options) => {
        options.onError(error);
      });
      render(<RegistrarUsuarioForm onCerrar={onCerrar} />);
      const user = await llenarFormularioValido();

      await user.click(screen.getByRole('button', { name: /registrar/i }));

      expect(toast.error).toHaveBeenCalledWith('Error al registrar el usuario', mensajeEsperado);
      expect(await screen.findByText(mensajeEsperado)).toBeInTheDocument();
      expect(screen.getByLabelText(etiquetaCampo)).toHaveAttribute('aria-invalid', 'true');
      expect(onCerrar).not.toHaveBeenCalled();
    },
  );

  it('un fieldError del backend con field "nombre" se pinta en nombres y en apellidos, además del toast', async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          error: 'Domain error',
          message: 'El nombre completo no es válido.',
          status: 422,
          fieldErrors: [{ field: 'nombre', message: 'El nombre completo no es válido.' }],
        },
      },
    };
    mockMutate.mockImplementation((_valores, options) => {
      options.onError(error);
    });
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);
    const user = await llenarFormularioValido();

    await user.click(screen.getByRole('button', { name: /registrar/i }));

    expect(toast.error).toHaveBeenCalled();
    const mensajes = await screen.findAllByText('El nombre completo no es válido.');
    expect(mensajes).toHaveLength(2);
    expect(screen.getByLabelText(/^nombres/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/^apellidos/i)).toHaveAttribute('aria-invalid', 'true');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('en un error sin campo asociado solo muestra el toast, sin marcar ningún input y sin cerrar', async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 503,
        data: { error: 'Service Unavailable', errorCode: 'USUARIO_IDP_NO_DISPONIBLE', message: 'Keycloak no disponible.', status: 503 },
      },
    };
    mockMutate.mockImplementation((_valores, options) => {
      options.onError(error);
    });
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);
    const user = await llenarFormularioValido();

    await user.click(screen.getByRole('button', { name: /registrar/i }));

    expect(toast.error).toHaveBeenCalledWith('Error al registrar el usuario', 'Keycloak no disponible.');
    expect(screen.getByLabelText(/identificador/i)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/^nombres/i)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/^apellidos/i)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/^contacto/i)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/identificador/i)).toHaveValue(datosValidos.identificador);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('mientras el envío está en curso deshabilita el submit y muestra "Registrando..."', () => {
    vi.mocked(useRegistrarUsuario).mockReturnValue(crearMutacionMock(mockMutate, true));
    render(<RegistrarUsuarioForm onCerrar={onCerrar} />);

    const submit = screen.getByRole('button', { name: /registrando/i });
    expect(submit).toBeDisabled();
  });
});
