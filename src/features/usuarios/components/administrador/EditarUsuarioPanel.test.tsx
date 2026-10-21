import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import EditarUsuarioPanel from './EditarUsuarioPanel';
import { usuariosService } from '../../services/usuariosService';
import { toast } from '../../../../shared/hooks/useToast';
import { Rol } from '../../../../shared/models/rol';
import { MENSAJES_VALIDACION } from '../../../../shared/validation';
import type { ApiError } from '../../../../shared/models/api-response';
import type { PestanaUsuario } from '../../models/PestanaUsuario';
import type { Usuario } from '../../models/Usuario';

vi.mock('../../services/usuariosService', () => ({
  usuariosService: {
    modificarUsuario: vi.fn(),
    consultarIdentidadUsuario: vi.fn(),
    getEstadosUsuario: vi.fn(),
    agregarRol: vi.fn(),
    cambiarEstadoUsuario: vi.fn(),
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
  esEstudiante: false,
};

const IDENTIDAD = { nombres: 'Marta', apellidos: 'Ríos' };

const ESTADOS = [
  { id: 'ACTIVO', nombre: 'Activo', descripcion: 'Puede operar' },
  { id: 'INACTIVO', nombre: 'Inactivo', descripcion: 'Sin acceso' },
];

const NOTA_ROLES = 'Sin botón de guardar: cada interruptor actúa al instante.';
const NOTA_ACCESO = 'Cada acción de esta pestaña pide confirmación.';

const DUPLICADO_DE_CORREO: ApiError = {
  error: 'Unprocessable Entity',
  errorCode: 'USUARIO_EMAIL_DUPLICADO',
  message: 'Ya existe un usuario con este correo.',
  status: 422,
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

interface OpcionesDeRender {
  usuario?: Usuario;
  pestanaInicial?: PestanaUsuario;
  onCerrar?: () => void;
}

async function renderizar({
  usuario = USUARIO,
  pestanaInicial = 'datos',
  onCerrar = vi.fn(),
}: OpcionesDeRender = {}) {
  render(
    <EditarUsuarioPanel usuario={usuario} pestanaInicial={pestanaInicial} onCerrar={onCerrar} />,
  );
  await screen.findByLabelText('Nombres');
  return onCerrar;
}

function campo(nombre: string) {
  return screen.getByLabelText(nombre);
}

function botonGuardar() {
  return screen.getByRole('button', { name: 'Guardar cambios' });
}

function pestanaActiva() {
  return screen.getByRole('tab', { selected: true });
}

describe('EditarUsuarioPanel', () => {
  beforeEach(() => {
    vi.mocked(usuariosService.modificarUsuario).mockReset();
    vi.mocked(usuariosService.agregarRol).mockReset();
    vi.mocked(usuariosService.consultarIdentidadUsuario).mockReset().mockResolvedValue(IDENTIDAD);
    vi.mocked(usuariosService.getEstadosUsuario).mockReset().mockResolvedValue(ESTADOS);
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('muestra la cabecera con nombre, correo y estado, y las tres pestañas: abre en la inicial y las flechas cambian de pestaña', async () => {
    // Arrange
    const user = userEvent.setup();
    await renderizar({ usuario: USUARIO_DADO_DE_BAJA, pestanaInicial: 'roles' });

    // Assert
    const panel = screen.getByRole('dialog', { name: USUARIO_DADO_DE_BAJA.nombre });
    expect(panel).toHaveAccessibleDescription(USUARIO_DADO_DE_BAJA.email);
    expect(screen.getByText('Dado de baja')).toBeInTheDocument();
    expect(
      within(screen.getByRole('tablist', { name: 'Secciones del usuario' }))
        .getAllByRole('tab')
        .map((pestana) => pestana.textContent),
    ).toEqual(['Datos', 'Roles', 'Acceso']);
    expect(pestanaActiva()).toHaveAccessibleName('Roles');
    expect(screen.getByRole('tabpanel', { name: 'Roles' })).toBeInTheDocument();
    expect(screen.queryByRole('tabpanel', { name: 'Datos' })).not.toBeInTheDocument();
    expect(screen.getByText(NOTA_ROLES)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();

    // Act
    await user.keyboard('{ArrowRight}');

    // Assert
    expect(pestanaActiva()).toHaveAccessibleName('Acceso');
    expect(screen.getByRole('tabpanel', { name: 'Acceso' })).toBeInTheDocument();
    expect(screen.getByText(NOTA_ACCESO)).toBeInTheDocument();

    // Act
    await user.keyboard('{ArrowLeft}{ArrowLeft}');

    // Assert
    expect(pestanaActiva()).toHaveAccessibleName('Datos');
    expect(screen.getByRole('tabpanel', { name: 'Datos' })).toBeInTheDocument();
    expect(botonGuardar()).toBeInTheDocument();
  });

  it('precarga los datos y habilita "Guardar cambios" solo mientras hay cambios', async () => {
    // Arrange
    const user = userEvent.setup();
    await renderizar();

    // Assert
    expect(campo('Identificador')).toHaveValue(USUARIO.identificador);
    expect(campo('Nombres')).toHaveValue(IDENTIDAD.nombres);
    expect(campo('Apellidos')).toHaveValue(IDENTIDAD.apellidos);
    expect(campo('Correo electrónico')).toHaveValue(USUARIO.email);
    expect(campo('Contacto')).toHaveValue(USUARIO.contacto);
    expect(botonGuardar()).toBeDisabled();

    // Act
    await user.type(campo('Contacto'), '0');

    // Assert
    expect(botonGuardar()).toBeEnabled();

    // Act
    await user.type(campo('Contacto'), '{Backspace}');

    // Assert
    expect(botonGuardar()).toBeDisabled();
  });

  it('valida al salir de cada campo, no apaga "Guardar cambios" por inválido y, al enviar, muestra el resumen sin guardar', async () => {
    // Arrange
    const user = userEvent.setup();
    await renderizar();

    // Act
    await user.clear(campo('Identificador'));
    await user.type(campo('Nombres'), '1');
    await user.clear(campo('Contacto'));
    await user.type(campo('Contacto'), 'abc1234567');
    await user.tab();

    // Assert
    expect(await screen.findByText(MENSAJES_VALIDACION.soloDigitos)).toBeInTheDocument();
    expect(campo('Nombres')).toHaveAccessibleDescription(
      expect.stringContaining(MENSAJES_VALIDACION.formatoNombre),
    );
    expect(campo('Identificador')).toHaveAccessibleDescription(MENSAJES_VALIDACION.requerido);
    expect(botonGuardar()).toBeEnabled();

    // Act
    await user.click(botonGuardar());

    // Assert
    expect(await screen.findByText('Revisa 3 campos antes de continuar')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Identificador: ${MENSAJES_VALIDACION.requerido}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Contacto: ${MENSAJES_VALIDACION.soloDigitos}` }),
    ).toBeInTheDocument();
    expect(campo('Identificador')).toHaveFocus();
    expect(usuariosService.modificarUsuario).not.toHaveBeenCalled();

    // Act
    await user.click(
      screen.getByRole('button', { name: `Nombres: ${MENSAJES_VALIDACION.formatoNombre}` }),
    );

    // Assert
    expect(campo('Nombres')).toHaveFocus();
  });

  it('envía identificador, nombres, apellidos, correo y contacto; mientras guarda muestra "Guardando…" y, en éxito, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const guardado = crearDiferido<void>();
    const nuevoContacto = '3109876543';
    vi.mocked(usuariosService.modificarUsuario).mockReturnValue(guardado.promesa);
    const onCerrar = await renderizar();
    await user.clear(campo('Contacto'));
    await user.type(campo('Contacto'), nuevoContacto);

    // Act
    await user.click(botonGuardar());

    // Assert
    expect(await screen.findByRole('button', { name: 'Guardando…' })).toBeDisabled();
    expect(usuariosService.modificarUsuario).toHaveBeenCalledWith(USUARIO.id, {
      identificador: USUARIO.identificador,
      nombres: IDENTIDAD.nombres,
      apellidos: IDENTIDAD.apellidos,
      email: USUARIO.email,
      contacto: nuevoContacto,
    });
    expect(onCerrar).not.toHaveBeenCalled();

    // Act
    guardado.resolver();

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith(
      'Cambios guardados',
      `Los datos de ${IDENTIDAD.nombres} ${IDENTIDAD.apellidos} se guardaron.`,
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('un error del backend se pinta junto a su campo, avisa con toast.error y no cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const nuevoCorreo = 'marta.rios@uco.edu.co';
    vi.mocked(usuariosService.modificarUsuario).mockRejectedValue(
      crearErrorApi(DUPLICADO_DE_CORREO),
    );
    const onCerrar = await renderizar();
    await user.clear(campo('Correo electrónico'));
    await user.type(campo('Correo electrónico'), nuevoCorreo);

    // Act
    await user.click(botonGuardar());

    // Assert
    expect(await screen.findByText('Revisa 1 campo antes de continuar')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudieron guardar los cambios',
      DUPLICADO_DE_CORREO.message,
    );
    expect(campo('Correo electrónico')).toHaveAccessibleDescription(DUPLICADO_DE_CORREO.message);
    expect(campo('Correo electrónico')).toHaveFocus();
    expect(campo('Correo electrónico')).toHaveValue(nuevoCorreo);
    expect(toast.success).not.toHaveBeenCalled();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('cerrar sin cambios no pide confirmación y con cambios pide descartarlos', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = await renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('dialog', { name: '¿Descartar los cambios?' }),
    ).not.toBeInTheDocument();
    expect(usuariosService.modificarUsuario).not.toHaveBeenCalled();

    // Act
    await user.type(campo('Contacto'), '0');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByRole('dialog', { name: '¿Descartar los cambios?' })).toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledTimes(1);

    // Act
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(2);
    expect(usuariosService.modificarUsuario).not.toHaveBeenCalled();
  });

  it('lo escrito en Datos y un rol recién encendido sobreviven a cambiar de pestaña y volver', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.agregarRol).mockResolvedValue(undefined);
    await renderizar();
    await user.type(campo('Contacto'), '0');

    // Act
    await user.click(screen.getByRole('tab', { name: 'Roles' }));
    await user.click(screen.getByRole('switch', { name: 'Asesor' }));
    await screen.findByRole('switch', { name: 'Asesor', checked: true });
    await user.click(screen.getByRole('tab', { name: 'Datos' }));

    // Assert
    expect(usuariosService.agregarRol).toHaveBeenCalledWith(USUARIO.id, Rol.Asesor);
    expect(campo('Contacto')).toHaveValue(`${USUARIO.contacto}0`);
    expect(botonGuardar()).toBeEnabled();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Roles' }));

    // Assert
    expect(screen.getByRole('switch', { name: 'Asesor' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Estudiante' })).toBeChecked();
  });
  it('con cambios sin guardar en Datos, el botón de las pestañas Roles y Acceso dice "Cancelar" y pide descartarlos', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = await renderizar();
    await user.type(campo('Contacto'), '0');
    await user.click(screen.getByRole('tab', { name: 'Roles' }));

    // Assert
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(
      await screen.findByRole('dialog', { name: /Descartar los cambios/ }),
    ).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('desde Acceso, con cambios sin guardar en Datos, un cambio de estado exitoso no cierra el panel y deja visible Datos; sin cambios, cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.cambiarEstadoUsuario).mockResolvedValue(undefined);
    const onCerrar = await renderizar();
    await user.type(campo('Contacto'), '0');
    await user.click(screen.getByRole('tab', { name: 'Acceso' }));
    await user.click(await screen.findByRole('radio', { name: 'Inactivo' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Aplicar cambio de estado' }));
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Estado cambiado', expect.any(String)),
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(pestanaActiva()).toHaveAccessibleName('Datos');
    expect(campo('Contacto')).toHaveValue(`${USUARIO.contacto}0`);
  });

  it('desde Acceso, sin cambios en Datos, un cambio de estado exitoso cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.cambiarEstadoUsuario).mockResolvedValue(undefined);
    const onCerrar = await renderizar({ pestanaInicial: 'acceso' });
    await user.click(await screen.findByRole('radio', { name: 'Inactivo' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Aplicar cambio de estado' }));
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
  });

  it('mientras llega la identidad muestra el esqueleto sin formulario y, al llegar, precarga nombres y apellidos', async () => {
    // Arrange
    const identidad = crearDiferido<typeof IDENTIDAD>();
    vi.mocked(usuariosService.consultarIdentidadUsuario).mockReturnValue(identidad.promesa);
    render(<EditarUsuarioPanel usuario={USUARIO} pestanaInicial="datos" onCerrar={vi.fn()} />);

    // Assert
    expect(
      within(await screen.findByRole('tabpanel', { name: 'Datos' })).getByRole('status'),
    ).toHaveTextContent('Cargando datos del usuario');
    expect(screen.queryByLabelText('Nombres')).not.toBeInTheDocument();
    expect(usuariosService.consultarIdentidadUsuario).toHaveBeenCalledWith(USUARIO.id);

    // Act
    identidad.resolver(IDENTIDAD);

    // Assert
    expect(await screen.findByLabelText('Nombres')).toHaveValue(IDENTIDAD.nombres);
    expect(campo('Apellidos')).toHaveValue(IDENTIDAD.apellidos);
    expect(botonGuardar()).toBeDisabled();
  });

  it('si la identidad falla muestra el error sin campos de nombre, deja operativas Roles y Acceso y "Reintentar" relanza la consulta', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.consultarIdentidadUsuario)
      .mockRejectedValueOnce(
        crearErrorApi({
          error: 'Service Unavailable',
          errorCode: 'USUARIO_IDP_NO_DISPONIBLE',
          message: 'El proveedor de identidad no está disponible.',
          status: 503,
        }),
      )
      .mockResolvedValue(IDENTIDAD);
    render(<EditarUsuarioPanel usuario={USUARIO} pestanaInicial="datos" onCerrar={vi.fn()} />);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El proveedor de identidad no está disponible.',
    );
    expect(screen.queryByLabelText('Nombres')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Roles' }));

    // Assert
    expect(screen.getByRole('switch', { name: 'Estudiante' })).toBeChecked();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Datos' }));
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(await screen.findByLabelText('Nombres')).toHaveValue(IDENTIDAD.nombres);
    expect(usuariosService.consultarIdentidadUsuario).toHaveBeenCalledTimes(2);
  });

  it('con apellidos vacíos desde el proveedor exige completarlos y no guarda', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.consultarIdentidadUsuario).mockResolvedValue({
      nombres: 'Marta',
      apellidos: '',
    });
    render(<EditarUsuarioPanel usuario={USUARIO} pestanaInicial="datos" onCerrar={vi.fn()} />);
    await user.type(await screen.findByLabelText('Contacto'), '0');

    // Act
    await user.click(botonGuardar());

    // Assert
    expect(campo('Apellidos')).toHaveValue('');
    expect(
      await screen.findByRole('button', { name: `Apellidos: ${MENSAJES_VALIDACION.requerido}` }),
    ).toBeInTheDocument();
    expect(usuariosService.modificarUsuario).not.toHaveBeenCalled();
  });

  it('un error del backend sobre "nombre" se pinta en Nombres y en Apellidos', async () => {
    // Arrange
    const user = userEvent.setup();
    const mensaje = 'El nombre contiene caracteres no permitidos.';
    vi.mocked(usuariosService.modificarUsuario).mockRejectedValue(
      new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
        data: {
          error: 'Unprocessable Entity',
          errorCode: 'USUARIO_NOMBRE_FORMATO',
          message: mensaje,
          status: 422,
          fieldErrors: [{ field: 'nombre', message: mensaje }],
        },
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    );
    const onCerrar = await renderizar();
    await user.type(campo('Contacto'), '0');

    // Act
    await user.click(botonGuardar());

    // Assert
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(campo('Nombres')).toHaveAccessibleDescription(expect.stringContaining(mensaje));
    expect(campo('Apellidos')).toHaveAccessibleDescription(expect.stringContaining(mensaje));
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
