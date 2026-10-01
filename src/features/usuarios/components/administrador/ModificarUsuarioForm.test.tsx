import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ModificarUsuarioForm from './ModificarUsuarioForm';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import { useAgregarRol } from '../../hooks/useAgregarRol';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { toast } from '../../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import type { Usuario } from '../../models/Usuario';

vi.mock('../../hooks/useModificarUsuario', () => ({
  useModificarUsuario: vi.fn(),
}));
vi.mock('../../hooks/useAgregarRol', () => ({
  useAgregarRol: vi.fn(),
}));
vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type ConfirmarRemocion = (usuarioId: string, rol: Rol, onExito?: () => void) => void;

function usarRemoverRolFalso(
  confirmar: ConfirmarRemocion,
  isPending = false,
): ReturnType<typeof useRemoverRol> {
  const [objetivo, setObjetivo] = useState<ReturnType<typeof useRemoverRol>['objetivo']>(null);
  return {
    objetivo,
    solicitar: setObjetivo,
    cancelar: () => setObjetivo(null),
    confirmar: (onExito) => {
      if (objetivo) confirmar(objetivo.usuarioId, objetivo.rol, onExito);
      setObjetivo(null);
    },
    isPending,
  };
}

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
  let mockRemover: Mock<ConfirmarRemocion>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    mockAgregar = vi.fn();
    mockRemover = vi.fn<ConfirmarRemocion>();
    vi.mocked(useModificarUsuario).mockReturnValue(crearMutacionMock(mockMutate));
    vi.mocked(useAgregarRol).mockReturnValue(
      crearMutacionMock<ReturnType<typeof useAgregarRol>>(mockAgregar),
    );
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover));
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

  it('un rol aún no disponible no se puede accionar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkboxJurado = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Jurado]}(\\(|$)`),
    });

    // Act
    await user.click(checkboxJurado);

    // Assert
    expect(checkboxJurado).toHaveAttribute('aria-disabled', 'true');
    expect(checkboxJurado).not.toBeChecked();
    expect(mockAgregar).not.toHaveBeenCalled();
    expect(mockRemover).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marcar Asesor en un usuario que no lo es llama al hook con su id y rol, y queda marcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onSuccess();
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Asesor]}(\\(|$)`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(mockAgregar).toHaveBeenCalledWith(
      { usuarioId: usuario.id, rol: Rol.Asesor },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      expect.stringContaining(ETIQUETAS_ROL[Rol.Asesor]),
    );
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-disabled', 'false');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('desmarcar Asesor abre la confirmación, cancelar lo deja marcado y confirmar lo desmarca', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, _rol, onExito) => onExito?.());
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={{ ...usuario, esAsesor: true }} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Asesor]}(\\(|$)`),
    });

    // Act
    await user.click(checkbox);
    const dialogo = screen.getByRole('dialog');
    const textoDialogo = dialogo.textContent;
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    const marcadoTrasCancelar = (checkbox as HTMLInputElement).checked;
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(textoDialogo).toContain(
      `¿Está seguro de eliminar el rol ${ETIQUETAS_ROL[Rol.Asesor]} para el usuario ${usuario.nombre}?`,
    );
    expect(marcadoTrasCancelar).toBe(true);
    expect(mockAgregar).not.toHaveBeenCalled();
    expect(mockRemover).toHaveBeenCalledTimes(1);
    expect(mockRemover).toHaveBeenCalledWith(usuario.id, Rol.Asesor, expect.any(Function));
    expect(checkbox).not.toBeChecked();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si agregar Asesor falla muestra toast.error y el checkbox queda desmarcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Ya es asesor' } },
      });
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Asesor]}(\\(|$)`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar el rol', 'Ya es asesor');
    expect(checkbox).not.toBeChecked();
  });

  it('marcar Asesor de Ficha llama al hook con su id y rol, y queda marcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onSuccess();
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.AsesorFicha]}`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(mockAgregar).toHaveBeenCalledWith(
      { usuarioId: usuario.id, rol: Rol.AsesorFicha },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      expect.stringContaining(ETIQUETAS_ROL[Rol.AsesorFicha]),
    );
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-disabled', 'false');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si agregar Asesor de Ficha falla muestra toast.error y el checkbox queda desmarcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Ya es asesor de ficha' } },
      });
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.AsesorFicha]}`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar el rol', 'Ya es asesor de ficha');
    expect(checkbox).not.toBeChecked();
  });

  it('marcar Representante del Comité llama al hook con su id y rol, y queda marcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onSuccess();
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.RepresentanteComiteCurriculum]}`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(mockAgregar).toHaveBeenCalledWith(
      { usuarioId: usuario.id, rol: Rol.RepresentanteComiteCurriculum },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      expect.stringContaining(ETIQUETAS_ROL[Rol.RepresentanteComiteCurriculum]),
    );
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-disabled', 'false');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si agregar Representante del Comité falla muestra toast.error y el checkbox queda desmarcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Ya es representante del comité' } },
      });
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.RepresentanteComiteCurriculum]}`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'Error al agregar el rol',
      'Ya es representante del comité',
    );
    expect(checkbox).not.toBeChecked();
  });

  it('marcar Administrador llama al hook con su id y rol, y queda marcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onSuccess();
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Administrador]}`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(mockAgregar).toHaveBeenCalledWith(
      { usuarioId: usuario.id, rol: Rol.Administrador },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Rol agregado',
      expect.stringContaining(ETIQUETAS_ROL[Rol.Administrador]),
    );
    expect(checkbox).toBeChecked();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si agregar Administrador falla muestra toast.error y el checkbox queda desmarcado', async () => {
    // Arrange
    mockAgregar.mockImplementation((_vars, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Ya es administrador' } },
      });
    });
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Administrador]}`),
    });

    // Act
    await user.click(checkbox);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('Error al agregar el rol', 'Ya es administrador');
    expect(checkbox).not.toBeChecked();
  });

  it('desmarcar Administrador abre la confirmación, cancelar lo deja marcado y confirmar lo desmarca', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, _rol, onExito) => onExito?.());
    const user = userEvent.setup();
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esAdministrador: true }} onCerrar={onCerrar} />,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.Administrador]}`),
    });

    // Act
    await user.click(checkbox);
    const dialogo = screen.getByRole('dialog');
    const textoDialogo = dialogo.textContent;
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    const marcadoTrasCancelar = (checkbox as HTMLInputElement).checked;
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(textoDialogo).toContain(
      `¿Está seguro de eliminar el rol ${ETIQUETAS_ROL[Rol.Administrador]} para el usuario ${usuario.nombre}?`,
    );
    expect(marcadoTrasCancelar).toBe(true);
    expect(mockAgregar).not.toHaveBeenCalled();
    expect(mockRemover).toHaveBeenCalledTimes(1);
    expect(mockRemover).toHaveBeenCalledWith(usuario.id, Rol.Administrador, expect.any(Function));
    expect(checkbox).not.toBeChecked();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('desmarcar Representante del Comité abre la confirmación, cancelar lo deja marcado y confirmar lo desmarca', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, _rol, onExito) => onExito?.());
    const user = userEvent.setup();
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esRepresentanteComite: true }} onCerrar={onCerrar} />,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.RepresentanteComiteCurriculum]}`),
    });

    // Act
    await user.click(checkbox);
    const dialogo = screen.getByRole('dialog');
    const textoDialogo = dialogo.textContent;
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    const marcadoTrasCancelar = (checkbox as HTMLInputElement).checked;
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(textoDialogo).toContain(
      `¿Está seguro de eliminar el rol ${ETIQUETAS_ROL[Rol.RepresentanteComiteCurriculum]} para el usuario ${usuario.nombre}?`,
    );
    expect(marcadoTrasCancelar).toBe(true);
    expect(mockAgregar).not.toHaveBeenCalled();
    expect(mockRemover).toHaveBeenCalledTimes(1);
    expect(mockRemover).toHaveBeenCalledWith(
      usuario.id,
      Rol.RepresentanteComiteCurriculum,
      expect.any(Function),
    );
    expect(checkbox).not.toBeChecked();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('desmarcar Asesor de Ficha abre la confirmación, cancelar lo deja marcado y confirmar lo desmarca', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, _rol, onExito) => onExito?.());
    const user = userEvent.setup();
    render(
      <ModificarUsuarioForm usuario={{ ...usuario, esAsesorFicha: true }} onCerrar={onCerrar} />,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`^${ETIQUETAS_ROL[Rol.AsesorFicha]}`),
    });

    // Act
    await user.click(checkbox);
    const dialogo = screen.getByRole('dialog');
    const textoDialogo = dialogo.textContent;
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    const marcadoTrasCancelar = (checkbox as HTMLInputElement).checked;
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(textoDialogo).toContain(
      `¿Está seguro de eliminar el rol ${ETIQUETAS_ROL[Rol.AsesorFicha]} para el usuario ${usuario.nombre}?`,
    );
    expect(marcadoTrasCancelar).toBe(true);
    expect(mockAgregar).not.toHaveBeenCalled();
    expect(mockRemover).toHaveBeenCalledTimes(1);
    expect(mockRemover).toHaveBeenCalledWith(usuario.id, Rol.AsesorFicha, expect.any(Function));
    expect(checkbox).not.toBeChecked();
    expect(onCerrar).not.toHaveBeenCalled();
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

  it('marcar Estudiante en un usuario que no lo es llama al hook con su id y rol, y queda marcado', async () => {
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
    expect(checkbox).toHaveAttribute('aria-disabled', 'false');
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

  it('confirmar quitar Coordinador llama al hook con el id y el rol y deja el checkbox desmarcado al éxito', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, _rol, onExito) => onExito?.());
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });

    // Act
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mockRemover).toHaveBeenCalledWith(usuario.id, Rol.Coordinador, expect.any(Function));
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('desmarcar Estudiante abre la confirmación, cancelar lo deja marcado y confirmar lo desmarca', async () => {
    // Arrange
    mockRemover.mockImplementation((_id, _rol, onExito) => onExito?.());
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Estudiante] });

    // Act
    await user.click(checkbox);
    const dialogo = screen.getByRole('dialog');
    const textoDialogo = dialogo.textContent;
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    const marcadoTrasCancelar = (checkbox as HTMLInputElement).checked;
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(textoDialogo).toContain(
      `¿Está seguro de eliminar el rol ${ETIQUETAS_ROL[Rol.Estudiante]} para el usuario ${usuario.nombre}?`,
    );
    expect(marcadoTrasCancelar).toBe(true);
    expect(mockRemover).toHaveBeenCalledTimes(1);
    expect(mockRemover).toHaveBeenCalledWith(usuario.id, Rol.Estudiante, expect.any(Function));
    expect(checkbox).not.toBeChecked();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si quitar el rol falla (el hook no invoca onExito) el checkbox sigue marcado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarUsuarioForm usuario={usuario} onCerrar={onCerrar} />);
    const checkbox = screen.getByRole('checkbox', { name: ETIQUETAS_ROL[Rol.Coordinador] });

    // Act
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mockRemover).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mientras se quita el rol el checkbox de Coordinador está deshabilitado y ocupado', () => {
    // Arrange
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover, true));

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
