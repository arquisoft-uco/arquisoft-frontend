import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { act, render, screen, waitFor, within } from '../../../../test-utils/render';
import RegistrarUsuarioPanel from './RegistrarUsuarioPanel';
import { usuariosService } from '../../services/usuariosService';
import { toast } from '../../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import { LIMITES, MENSAJES_VALIDACION } from '../../../../shared/validation';
import type { ApiError } from '../../../../shared/models/api-response';
import type { UsuarioRegistradoResponse } from '../../models/UsuarioRegistradoResponse';

vi.mock('../../services/usuariosService', () => ({
  usuariosService: { registrarUsuario: vi.fn() },
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

const DATOS = {
  identificador: '1234567890',
  nombres: 'Juan Camilo',
  apellidos: 'Pérez Gómez',
  email: 'juan.perez@uco.edu.co',
  contacto: '3001234567',
};

const REGISTRADO: UsuarioRegistradoResponse = { id: 'u-9' };

const ROLES_OFRECIDOS = [
  Rol.Estudiante,
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.Coordinador,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
  Rol.Bibliotecario,
];

const DUPLICADO_DE_CORREO: ApiError = {
  error: 'Unprocessable Entity',
  errorCode: 'USUARIO_EMAIL_DUPLICADO',
  message: 'Ya existe un usuario con este correo.',
  status: 422,
};

const NOMBRE_NO_VALIDO: ApiError = {
  error: 'Unprocessable Entity',
  message: 'El nombre completo no es válido.',
  status: 422,
  fieldErrors: [{ field: 'nombre', message: 'El nombre completo no es válido.' }],
};

const SIN_CAMPO: ApiError = {
  error: 'Service Unavailable',
  errorCode: 'USUARIO_IDP_NO_DISPONIBLE',
  message: 'No se pudo crear la cuenta en este momento.',
  status: 503,
};

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function crearDiferido<T>() {
  let resolver: (valor: T) => void = () => undefined;
  const promesa = new Promise<T>((resolve) => {
    resolver = resolve;
  });
  return { promesa, resolver: (valor: T) => resolver(valor) };
}

function campo(nombre: string) {
  return screen.getByLabelText(nombre);
}

function chipDeRol(rol: Rol) {
  const grupo = within(screen.getByRole('group', { name: 'Roles iniciales' }));
  return grupo.getByRole('button', { name: ETIQUETAS_ROL[rol] });
}

function botonRegistrar() {
  return screen.getByRole('button', { name: 'Registrar usuario' });
}

async function llenarFormulario(user: UserEvent) {
  await user.type(campo('Identificador'), DATOS.identificador);
  await user.type(campo('Nombres'), DATOS.nombres);
  await user.type(campo('Apellidos'), DATOS.apellidos);
  await user.type(campo('Correo electrónico'), DATOS.email);
  await user.type(campo('Contacto'), DATOS.contacto);
}

function expectDatosIntactos() {
  expect(campo('Identificador')).toHaveValue(DATOS.identificador);
  expect(campo('Nombres')).toHaveValue(DATOS.nombres);
  expect(campo('Apellidos')).toHaveValue(DATOS.apellidos);
  expect(campo('Correo electrónico')).toHaveValue(DATOS.email);
  expect(campo('Contacto')).toHaveValue(DATOS.contacto);
}

async function enviarFallando(cuerpo: ApiError) {
  const user = userEvent.setup();
  const onCerrar = vi.fn();
  vi.mocked(usuariosService.registrarUsuario).mockRejectedValue(crearErrorApi(cuerpo));
  render(<RegistrarUsuarioPanel onCerrar={onCerrar} />);
  await llenarFormulario(user);

  await user.click(botonRegistrar());
  await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
  await act(async () => {});

  return onCerrar;
}

describe('RegistrarUsuarioPanel', () => {
  beforeEach(() => {
    vi.mocked(usuariosService.registrarUsuario).mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('muestra las secciones, las ayudas y los siete roles registrables, y no deshabilita "Registrar usuario" con el formulario vacío', () => {
    // Act
    render(<RegistrarUsuarioPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Registrar usuario' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Datos personales' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Roles/ })).toHaveTextContent('Roles (opcional)');
    expect(campo('Identificador')).toHaveAccessibleDescription(
      `De ${LIMITES.USUARIO_IDENTIFICADOR_MIN} a ${LIMITES.USUARIO_IDENTIFICADOR_MAX} caracteres. No se puede repetir.`,
    );
    expect(campo('Correo electrónico')).toHaveAccessibleDescription('No se puede repetir.');
    expect(
      screen.getByText(
        `Nombres y apellidos juntos pueden tener hasta ${LIMITES.USUARIO_NOMBRE_MAX} caracteres.`,
      ),
    ).toBeInTheDocument();
    expect(campo('Contacto')).toHaveAccessibleDescription(
      `Entre ${LIMITES.USUARIO_CONTACTO_MIN} y ${LIMITES.USUARIO_CONTACTO_MAX} dígitos.`,
    );

    const chips = within(screen.getByRole('group', { name: 'Roles iniciales' })).getAllByRole(
      'button',
      { pressed: false },
    );
    expect(chips.map((chip) => chip.textContent)).toEqual(
      ROLES_OFRECIDOS.map((rol) => ETIQUETAS_ROL[rol]),
    );
    expect(
      screen.queryByRole('button', { name: ETIQUETAS_ROL[Rol.Jurado] }),
    ).not.toBeInTheDocument();
    expect(botonRegistrar()).toBeEnabled();
  });

  it('muestra el error de un campo al salir de él y no mientras se escribe', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegistrarUsuarioPanel onCerrar={vi.fn()} />);

    // Act
    await user.type(campo('Identificador'), 'ab');

    // Assert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Act
    await user.tab();

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      MENSAJES_VALIDACION.longitudEntre(
        LIMITES.USUARIO_IDENTIFICADOR_MIN,
        LIMITES.USUARIO_IDENTIFICADOR_MAX,
      ),
    );
    expect(campo('Identificador')).toBeInvalid();
    expect(campo('Correo electrónico')).toBeValid();
  });

  it('revalida nombres y apellidos entre sí solo cuando el otro ya se visitó', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegistrarUsuarioPanel onCerrar={vi.fn()} />);
    const longitudConjunta = MENSAJES_VALIDACION.longitudEntre(
      LIMITES.USUARIO_NOMBRE_MIN,
      LIMITES.USUARIO_NOMBRE_MAX,
    );

    // Act
    await user.type(campo('Nombres'), 'a'.repeat(40));
    await user.tab();

    // Assert
    expect(campo('Apellidos')).toHaveFocus();
    expect(campo('Apellidos')).toBeValid();
    expect(campo('Nombres')).toBeValid();

    // Act
    await user.type(campo('Apellidos'), 'b'.repeat(20));
    await user.tab();

    // Assert
    expect(await screen.findAllByText(longitudConjunta)).toHaveLength(2);
    expect(campo('Nombres')).toBeInvalid();
    expect(campo('Apellidos')).toBeInvalid();

    // Act
    await user.clear(campo('Apellidos'));
    await user.type(campo('Apellidos'), 'b'.repeat(5));

    // Assert
    await waitFor(() => expect(screen.queryByText(longitudConjunta)).not.toBeInTheDocument());
    expect(campo('Nombres')).toBeValid();
    expect(campo('Apellidos')).toBeValid();
  });

  it('el envío con errores muestra el resumen, enfoca el primer campo con error y no registra; su enlace lleva al campo', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegistrarUsuarioPanel onCerrar={vi.fn()} />);

    // Act
    await user.click(botonRegistrar());

    // Assert
    expect(await screen.findByText('Revisa 5 campos antes de continuar')).toBeInTheDocument();
    expect(campo('Identificador')).toHaveFocus();
    expect(usuariosService.registrarUsuario).not.toHaveBeenCalled();

    // Act
    await user.click(
      screen.getByRole('button', { name: `Contacto: ${MENSAJES_VALIDACION.requerido}` }),
    );

    // Assert
    expect(campo('Contacto')).toHaveFocus();
  });

  it('envía los datos con los roles marcados y, en éxito, avisa y cierra sin pedir confirmación', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    vi.mocked(usuariosService.registrarUsuario).mockResolvedValue(REGISTRADO);
    render(<RegistrarUsuarioPanel onCerrar={onCerrar} />);
    await llenarFormulario(user);

    // Act
    await user.click(chipDeRol(Rol.Coordinador));
    await user.click(chipDeRol(Rol.Bibliotecario));

    // Assert
    expect(chipDeRol(Rol.Coordinador)).toHaveAttribute('aria-pressed', 'true');
    expect(chipDeRol(Rol.Bibliotecario)).toHaveAttribute('aria-pressed', 'true');
    expect(chipDeRol(Rol.Estudiante)).toHaveAttribute('aria-pressed', 'false');

    // Act
    await user.click(botonRegistrar());

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(usuariosService.registrarUsuario).toHaveBeenCalledWith({
      ...DATOS,
      roles: [Rol.Coordinador, Rol.Bibliotecario],
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Usuario registrado',
      `${DATOS.nombres} ${DATOS.apellidos} fue registrado correctamente.`,
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('dialog', { name: '¿Descartar los cambios?' }),
    ).not.toBeInTheDocument();
  });

  describe('cuando el backend rechaza el registro', () => {
    it('un duplicado se pinta junto a su campo, lo enfoca y avisa con toast.error', async () => {
      // Act
      const onCerrar = await enviarFallando(DUPLICADO_DE_CORREO);

      // Assert
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo registrar el usuario',
        DUPLICADO_DE_CORREO.message,
      );
      expect(campo('Correo electrónico')).toBeInvalid();
      expect(campo('Correo electrónico')).toHaveAccessibleDescription(DUPLICADO_DE_CORREO.message);
      expect(campo('Correo electrónico')).toHaveFocus();
      expect(campo('Identificador')).toBeValid();
      expect(screen.getByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
      expect(onCerrar).not.toHaveBeenCalled();
      expectDatosIntactos();
    });

    it('el "nombre" del backend se pinta en Nombres y en Apellidos', async () => {
      // Act
      const onCerrar = await enviarFallando(NOMBRE_NO_VALIDO);

      // Assert
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo registrar el usuario',
        NOMBRE_NO_VALIDO.message,
      );
      expect(campo('Nombres')).toHaveAccessibleDescription(NOMBRE_NO_VALIDO.message);
      expect(campo('Apellidos')).toHaveAccessibleDescription(NOMBRE_NO_VALIDO.message);
      expect(campo('Nombres')).toHaveFocus();
      expect(campo('Identificador')).toBeValid();
      expect(screen.getByText('Revisa 2 campos antes de continuar')).toBeInTheDocument();
      expect(onCerrar).not.toHaveBeenCalled();
      expectDatosIntactos();
    });

    it('un error sin campo asociado solo avisa con toast.error, sin marcar ningún campo', async () => {
      // Act
      const onCerrar = await enviarFallando(SIN_CAMPO);

      // Assert
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo registrar el usuario',
        SIN_CAMPO.message,
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: 'Registrar usuario' })).toBeInTheDocument();
      expect(onCerrar).not.toHaveBeenCalled();
      expectDatosIntactos();
    });
  });

  it('mientras envía muestra "Registrando…" y no se cierra con Esc', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const envio = crearDiferido<UsuarioRegistradoResponse>();
    vi.mocked(usuariosService.registrarUsuario).mockReturnValue(envio.promesa);
    render(<RegistrarUsuarioPanel onCerrar={onCerrar} />);
    await llenarFormulario(user);

    // Act
    await user.click(botonRegistrar());
    const registrando = await screen.findByRole('button', { name: 'Registrando…' });
    await user.click(campo('Identificador'));
    await user.keyboard('{Escape}');

    // Assert
    expect(registrando).toBeDisabled();
    expect(onCerrar).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('dialog', { name: '¿Descartar los cambios?' }),
    ).not.toBeInTheDocument();

    // Act
    envio.resolver(REGISTRADO);

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
  });

  it('cerrar con datos escritos pide descartarlos: "Seguir editando" conserva y "Descartar" cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<RegistrarUsuarioPanel onCerrar={onCerrar} />);
    await user.type(campo('Identificador'), DATOS.identificador);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    const confirmacion = screen.getByRole('dialog', { name: '¿Descartar los cambios?' });
    expect(onCerrar).not.toHaveBeenCalled();

    // Act
    await user.click(within(confirmacion).getByRole('button', { name: 'Seguir editando' }));

    // Assert
    expect(
      screen.queryByRole('dialog', { name: '¿Descartar los cambios?' }),
    ).not.toBeInTheDocument();
    expect(campo('Identificador')).toHaveValue(DATOS.identificador);
    expect(onCerrar).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
