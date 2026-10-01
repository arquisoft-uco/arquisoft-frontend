import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ModificarUsuarioForm from './ModificarUsuarioForm';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import { useAgregarRol } from '../../hooks/useAgregarRol';
import { useRemoverCoordinador } from '../../hooks/useRemoverCoordinador';
import { toast } from '../../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import type { Usuario } from '../../models/Usuario';

vi.mock('../../hooks/useModificarUsuario', () => ({
  useModificarUsuario: vi.fn(),
}));
vi.mock('../../hooks/useAgregarRol', () => ({
  useAgregarRol: vi.fn(),
}));
vi.mock('../../hooks/useRemoverCoordinador', () => ({
  useRemoverCoordinador: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type MutacionModificarUsuario = ReturnType<typeof useModificarUsuario>;

function crearMutacionMock<T = MutacionModificarUsuario>(
  mutate: ReturnType<typeof vi.fn>,
  isPending = false,
): T {
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
  } as T;
}

const usuario: Usuario = {
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
};

describe('ModificarUsuarioForm', () => {
  const onCerrar = vi.fn();
  let mockMutate: ReturnType<typeof vi.fn>;
  let mockAgregar: ReturnType<typeof vi.fn>;
  let mockRemover: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    mockAgregar = vi.fn();
    mockRemover = vi.fn();
    vi.mocked(useModificarUsuario).mockReturnValue(crearMutacionMock(mockMutate));
    vi.mocked(useAgregarRol).mockReturnValue(
      crearMutacionMock<ReturnType<typeof useAgregarRol>>(mockAgregar),
    );
    vi.mocked(useRemoverCoordinador).mockReturnValue(
      crearMutacionMock<ReturnType<typeof useRemoverCoordinador>>(mockRemover),
    );
  });

  it('precarga los campos de texto y marca los checkboxes de los roles ya asignados', () => {
    // Act
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);

    // Assert
    expect(screen.getByLabelText(/identificador/i)).toHaveValue(usuario.identificador);
    expect(screen.getByLabelText(/^nombre/i)).toHaveValue(usuario.nombre);
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(usuario.email);
    expect(screen.getByLabelText(/^contacto/i)).toHaveValue(usuario.contacto);
    expect(screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Estudiante] })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: new RegExp(`^${ETIQUETAS_ROL[Rol.Asesor]}(\\(|$)`) }),
    ).not.toBeChecked();
  });

  it('un Estudiante ya asignado y los roles aún no disponibles no se pueden accionar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkboxEstudiante = screen.getByRole('checkbox', {
      name: ETIQUETAS_ROL[Rol.Estudiante],
    });
    const checkboxAsesor = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Asesor]}(\\(|$)`),
    });

    // Act
    await user.click(checkboxEstudiante);
    await user.click(checkboxAsesor);

    // Assert
    expect(checkboxEstudiante).toHaveAttribute('aria-disabled', 'true');
    expect(checkboxEstudiante).toBeChecked();
    expect(checkboxAsesor).toHaveAttribute('aria-disabled', 'true');
    expect(checkboxAsesor).not.toBeChecked();
    expect(mockAgregar).not.toHaveBeenCalled();
    expect(mockRemover).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marcar Coordinador en un usuario que no lo es llama al hook con su id y queda marcado tras el éxito', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onSuccess();
    });
    const user = userEvent.setup();
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esCoordinador: false }} onCerrar={onCerrar} />,
    );
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });

    // Act
    await user.click(checkbox);

    // Assert
    expect(mockAgregar).toHaveBeenCalledWith(
      { usuarioId: usuario.id, rol: Rol.Coordinador },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Rol agregado', expect.any(String));
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-disabled', 'false');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('marcar Estudiante en un usuario que no lo es llama al hook con su id y rol, y queda marcado y bloqueado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onSuccess();
    });
    const user = userEvent.setup();
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esEstudiante: false }} onCerrar={onCerrar} />,
    );
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Estudiante] });

    // Act
    await user.click(checkbox);

    // Assert
    expect(mockAgregar).toHaveBeenCalledWith(
      { usuarioId: usuario.id, rol: Rol.Estudiante },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      expect.stringContaining(ETIQUETAS_ROL[Rol.Estudiante]),
    );
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si agregar Estudiante falla muestra toast.error y el checkbox queda desmarcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Usuario eliminado' } },
      });
    });
    const user = userEvent.setup();
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esEstudiante: false }} onCerrar={onCerrar} />,
    );
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Estudiante] });

    // Act
    await user.click(checkbox);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar el rol', 'Usuario eliminado');
    expect(checkbox).not.toBeChecked();
  });

  it('si agregar Coordinador falla muestra toast.error y el checkbox queda desmarcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 503, data: { message: 'IDP caído' } },
      });
    });
    const user = userEvent.setup();
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esCoordinador: false }} onCerrar={onCerrar} />,
    );
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });

    // Act
    await user.click(checkbox);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar el rol', expect.any(String));
    expect(checkbox).not.toBeChecked();
  });

  it('mientras se agrega el rol el checkbox de Coordinador está deshabilitado y ocupado', () => {
    // Arrange
    vi.mocked(useAgregarRol).mockReturnValue(
      crearMutacionMock<ReturnType<typeof useAgregarRol>>(mockAgregar, true),
    );

    // Act
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esCoordinador: false }} onCerrar={onCerrar} />,
    );

    // Assert
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute('aria-busy', 'true');
  });

  it('desmarcar Coordinador abre la confirmación con el texto exacto y cancelar lo deja marcado sin llamar al hook', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });

    // Act
    await user.click(checkbox);
    const dialogo = screen.getByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(dialogo).toHaveTextContent(
      `¿Está seguro de eliminar el rol ${ETIQUETAS_ROL[Rol.Coordinador]} para el usuario ${usuario.nombre}?`,
    );
    expect(mockRemover).not.toHaveBeenCalled();
    expect(checkbox).toBeChecked();
  });

  it('confirmar quitar Coordinador llama al hook con el id, muestra toast.success y deja el checkbox desmarcado', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, options) => {
      options.onSuccess();
      options.onSettled();
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });

    // Act
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mockRemover).toHaveBeenCalledWith(usuario.id, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Rol eliminado', expect.any(String));
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si quitar Coordinador falla muestra toast.error y el checkbox sigue marcado', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Sin rol vigente' } },
      });
      options.onSettled();
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });

    // Act
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar el rol', 'Sin rol vigente');
    expect(checkbox).toBeChecked();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mientras se quita el rol el checkbox de Coordinador está deshabilitado y ocupado', () => {
    // Arrange
    vi.mocked(useRemoverCoordinador).mockReturnValue(
      crearMutacionMock<ReturnType<typeof useRemoverCoordinador>>(mockRemover, true),
    );

    // Act
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);

    // Assert
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute('aria-busy', 'true');
  });

  it('mantiene el submit deshabilitado cuando identificador queda vacío, contacto no es numérico y nombre tiene un dígito', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const submit = screen.getByRole('button', { name: /guardar cambios/i });

    // Act
    await user.clear(screen.getByLabelText(/identificador/i));
    await user.clear(screen.getByLabelText(/^contacto/i));
    await user.type(screen.getByLabelText(/^contacto/i), 'abc1234567');
    await user.clear(screen.getByLabelText(/^nombre/i));
    await user.type(screen.getByLabelText(/^nombre/i), 'Marta1');

    // Assert
    expect(submit).toBeDisabled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('con datos válidos envía solo los datos, sin roles', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const submit = screen.getByRole('button', { name: /guardar cambios/i });

    // Act
    await user.clear(screen.getByLabelText(/^contacto/i));
    await user.type(screen.getByLabelText(/^contacto/i), usuario.contacto);
    expect(submit).toBeEnabled();
    await user.click(submit);

    // Assert
    expect(mockMutate).toHaveBeenCalledTimes(1);
    const [payload, opciones] = mockMutate.mock.calls[0];
    expect(payload).toEqual({
      usuarioId: usuario.id,
      req: {
        identificador: usuario.identificador,
        nombre: usuario.nombre,
        email: usuario.email,
        contacto: usuario.contacto,
      },
    });
    expect(opciones).toEqual(
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('en éxito muestra el toast de éxito y cierra el formulario con onCerrar', async () => {
    // Arrange
    mockMutate.mockImplementation((_valores, options) => {
      options.onSuccess();
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Assert
    expect(toast.success).toHaveBeenCalledWith(
      'Usuario actualizado',
      expect.stringContaining(usuario.nombre),
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'USUARIO_IDENTIFICADOR_DUPLICADO',
      /identificador/i,
      'Ya existe un usuario con este identificador.',
    ],
    ['USUARIO_EMAIL_DUPLICADO', /correo electrónico/i, 'Ya existe un usuario con este correo.'],
    ['USUARIO_CONTACTO_DUPLICADO', /^contacto/i, 'Ya existe un usuario con este contacto.'],
  ])(
    'en un 422 de duplicado por %s muestra toast.error y el error en el campo, sin cerrar el formulario',
    async (errorCode, etiquetaCampo, mensajeEsperado) => {
      // Arrange
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
      const user = userEvent.setup();
      render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);

      // Act
      await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

      // Assert
      expect(toast.error).toHaveBeenCalledWith('Error al actualizar el usuario', mensajeEsperado);
      expect(await screen.findByText(mensajeEsperado)).toBeInTheDocument();
      expect(screen.getByLabelText(etiquetaCampo)).toHaveAttribute('aria-invalid', 'true');
      expect(onCerrar).not.toHaveBeenCalled();
    },
  );

  it('cancelar cierra el formulario sin invocar la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Assert
    expect(mockMutate).not.toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('mientras el envío está en curso deshabilita el submit y muestra "Guardando..."', () => {
    // Arrange
    vi.mocked(useModificarUsuario).mockReturnValue(crearMutacionMock(mockMutate, true));

    // Act
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);

    // Assert
    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
  });
});
