import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ModificarUsuarioForm from './ModificarUsuarioForm';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import { toast } from '../../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import type { Usuario } from '../../models/Usuario';

vi.mock('../../hooks/useModificarUsuario', () => ({
  useModificarUsuario: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type MutacionModificarUsuario = ReturnType<typeof useModificarUsuario>;

function crearMutacionMock(
  mutate: ReturnType<typeof vi.fn>,
  isPending = false,
): MutacionModificarUsuario {
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
  } as MutacionModificarUsuario;
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    vi.mocked(useModificarUsuario).mockReturnValue(crearMutacionMock(mockMutate));
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
    expect(screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Asesor] })).not.toBeChecked();
  });

  it('los roles ya asignados están marcados como no editables y no se pueden desmarcar, pero uno nuevo sí puede marcarse', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkboxEstudiante = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Estudiante] });
    const checkboxAsesor = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Asesor] });

    // Act
    expect(checkboxEstudiante).toHaveAttribute('aria-disabled', 'true');
    await user.click(checkboxEstudiante);
    await user.click(checkboxAsesor);

    // Assert
    expect(checkboxEstudiante).toBeChecked();
    expect(checkboxAsesor).toBeChecked();
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

  it('con datos válidos envía el payload con los datos y la unión de roles asignados más el nuevo marcado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Asesor] }));
    const submit = screen.getByRole('button', { name: /guardar cambios/i });
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
        roles: expect.arrayContaining([Rol.Estudiante, Rol.Coordinador, Rol.Asesor]),
      },
    });
    expect(payload.req.roles).toHaveLength(3);
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
    ['USUARIO_IDENTIFICADOR_DUPLICADO', /identificador/i, 'Ya existe un usuario con este identificador.'],
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
