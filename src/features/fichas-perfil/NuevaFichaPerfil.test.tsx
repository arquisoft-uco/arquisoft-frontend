import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen, within } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import NuevaFichaPerfil from './NuevaFichaPerfil';
import { Rol } from '../../shared/models/rol';
import { useRegistrarFichaPerfil } from './hooks/useRegistrarFichaPerfil';
import { useAsesoresFichaVigentes } from '../../shared/hooks/useAsesoresFichaVigentes';
import { useEstudiantesVigentes } from '../../shared/hooks/useEstudiantesVigentes';
import { toast } from '../../shared/hooks/useToast';
import type { Asesor } from '../../shared/models/Asesor';
import type { EstudianteVigente } from '../../shared/models/EstudianteVigente';

vi.mock('./hooks/useRegistrarFichaPerfil', () => ({ useRegistrarFichaPerfil: vi.fn() }));
vi.mock('../../shared/hooks/useAsesoresFichaVigentes', () => ({
  useAsesoresFichaVigentes: vi.fn(),
}));
vi.mock('../../shared/hooks/useEstudiantesVigentes', () => ({ useEstudiantesVigentes: vi.fn() }));
vi.mock('../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useRegistrarMock = vi.mocked(useRegistrarFichaPerfil);
const useAsesoresMock = vi.mocked(useAsesoresFichaVigentes);
const useEstudiantesMock = vi.mocked(useEstudiantesVigentes);

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const E1: EstudianteVigente = { id: 'e-1', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };
const E2: EstudianteVigente = { id: 'e-2', nombre: 'Marta Ríos', email: 'marta@uco.edu.co' };

const RUTA_NUEVA = '/fichas-perfil/nueva?q=monitoreo&pagina=2';

function Listado() {
  return <p>Listado de fichas{useLocation().search}</p>;
}

function mockCatalogos(
  asesores: Partial<ReturnType<typeof useAsesoresFichaVigentes>> = {},
  estudiantes: Partial<ReturnType<typeof useEstudiantesVigentes>> = {},
) {
  useAsesoresMock.mockReturnValue({
    data: [ANA],
    isLoading: false,
    isError: false,
    ...asesores,
  } as ReturnType<typeof useAsesoresFichaVigentes>);
  useEstudiantesMock.mockReturnValue({
    data: [E1, E2],
    isLoading: false,
    isError: false,
    ...estudiantes,
  } as ReturnType<typeof useEstudiantesVigentes>);
}

function mockMutacion(mutate = vi.fn()) {
  useRegistrarMock.mockReturnValue({
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
  } as ReturnType<typeof useRegistrarFichaPerfil>);
  return mutate;
}

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function renderizar(ruta = RUTA_NUEVA) {
  return render(
    <Routes>
      <Route path="/fichas-perfil/nueva" element={<NuevaFichaPerfil />} />
      <Route path="/fichas-perfil" element={<Listado />} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: ruta },
  );
}

function crearErrorApi(errorCode: string, message: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type Usuario = ReturnType<typeof userEvent.setup>;

async function llenarFormulario(user: Usuario) {
  await user.type(screen.getByRole('textbox', { name: /Título del proyecto/ }), 'Sistema nuevo');
  await user.click(screen.getByRole('combobox', { name: 'Asesor' }));
  await user.click(screen.getByRole('option', { name: /Ana Pérez/ }));
  await user.click(screen.getByRole('combobox', { name: 'Estudiantes' }));
  await user.click(screen.getByRole('option', { name: /Luis Gómez/ }));
}

describe('NuevaFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    autenticarCon(Rol.Coordinador);
    mockCatalogos();
    mockMutacion();
  });

  it('un rol distinto de coordinador es enviado a /forbidden', () => {
    // Arrange
    autenticarCon(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Nueva ficha de perfil' }),
    ).not.toBeInTheDocument();
  });

  it('muestra el error del título al salir del campo vacío, sin mostrarlo al montar', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    const titulo = screen.getByRole('textbox', { name: /Título del proyecto/ });

    // Assert
    expect(screen.queryByText('Este campo es requerido')).not.toBeInTheDocument();

    // Act
    await user.click(titulo);
    await user.tab();

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Este campo es requerido');
  });

  it('enviar con errores muestra el resumen, enfoca el primer campo y no registra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar ficha' }));

    // Assert
    expect(await screen.findByText('Revisa 3 campos antes de continuar')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Título del proyecto/ })).toHaveFocus();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('con datos válidos registra con el mapeo correcto, notifica y vuelve al listado con su búsqueda', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion(
      vi.fn((_req: unknown, opciones?: { onSuccess?: () => void }) => opciones?.onSuccess?.()),
    );
    renderizar();

    // Act
    await llenarFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Registrar ficha' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { tituloProyecto: 'Sistema nuevo', asesorFichaId: 'a-1', estudiantesIds: ['e-1'] },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Ficha de perfil registrada', expect.any(String));
    expect(await screen.findByText('Listado de fichas?q=monitoreo&pagina=2')).toBeInTheDocument();
  });

  it('si el backend rechaza el registro notifica el error, conserva los datos y no navega', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(
      vi.fn((_req: unknown, opciones?: { onError?: (e: unknown) => void }) =>
        opciones?.onError?.(crearErrorApi('ASESOR_NO_VIGENTE', 'El asesor ya no está vigente')),
      ),
    );
    renderizar();

    // Act
    await llenarFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Registrar ficha' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'Error al registrar la ficha',
      'El asesor ya no está vigente',
    );
    expect(screen.getByRole('textbox', { name: /Título del proyecto/ })).toHaveValue(
      'Sistema nuevo',
    );
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.queryByText(/Listado de fichas/)).not.toBeInTheDocument();
  });

  it('un título duplicado se pinta bajo el campo además del toast', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(
      vi.fn((_req: unknown, opciones?: { onError?: (e: unknown) => void }) =>
        opciones?.onError?.(crearErrorApi('FICHA_TITULO_DUPLICADO', 'Ya existe una ficha así')),
      ),
    );
    renderizar();

    // Act
    await llenarFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Registrar ficha' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una ficha así');
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['asesores', { asesores: { data: undefined, isError: true }, estudiantes: {} }],
    ['estudiantes', { asesores: {}, estudiantes: { data: undefined, isError: true } }],
  ])('si el catálogo de %s falla muestra el aviso y deshabilita el envío', (recurso, parciales) => {
    // Arrange
    mockCatalogos(parciales.asesores, parciales.estudiantes);

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('note', { name: `No disponible: ${recurso}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar ficha' })).toBeDisabled();
  });

  it('cancelar sin cambios vuelve al listado con su búsqueda sin pedir confirmación', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.getByText('Listado de fichas?q=monitoreo&pagina=2')).toBeInTheDocument();
  });

  it('cancelar con cambios pide confirmación: Seguir editando conserva y Descartar vuelve', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByRole('textbox', { name: /Título del proyecto/ }), 'Borrador');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    const dialogo = screen.getByRole('dialog', { name: '¿Descartar los cambios?' });
    await user.click(within(dialogo).getByRole('button', { name: 'Seguir editando' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Título del proyecto/ })).toHaveValue('Borrador');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(screen.getByText('Listado de fichas?q=monitoreo&pagina=2')).toBeInTheDocument();
  });

  it('con cambios sin guardar la miga pide confirmación y no navega', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    const miga = () => screen.getByRole('link', { name: 'Fichas de perfil' });

    // Act: con cambios
    await user.type(screen.getByRole('textbox', { name: /Título del proyecto/ }), 'Borrador');
    await user.click(miga());

    // Assert
    expect(screen.getByRole('dialog', { name: '¿Descartar los cambios?' })).toBeInTheDocument();
    expect(screen.queryByText(/Listado de fichas/)).not.toBeInTheDocument();
  });

  it('la miga sin cambios vuelve al listado con la búsqueda que traía', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.click(screen.getByRole('link', { name: 'Fichas de perfil' }));

    // Assert
    expect(screen.getByText('Listado de fichas?q=monitoreo&pagina=2')).toBeInTheDocument();
  });

  it('el resumen pasa de pendiente a completo a medida que se eligen los datos', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    const resumen = within(screen.getByRole('complementary', { name: 'Resumen de la ficha' }));

    // Assert
    expect(resumen.getAllByText(/: pendiente/)).toHaveLength(3);

    // Act
    await llenarFormulario(user);

    // Assert
    expect(resumen.getAllByText(/: completo/)).toHaveLength(3);
    expect(resumen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(resumen.getByText('1 de 3: Luis Gómez')).toBeInTheDocument();
  });
});
