import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
import { resetAllStores } from '../../../../test-utils/store.utils';
import RegistrarFichaPerfilPanel from './RegistrarFichaPerfilPanel';
import { useRegistrarFichaPerfil } from '../../hooks/useRegistrarFichaPerfil';
import { useAsesoresFichaVigentes } from '../../../../shared/hooks/useAsesoresFichaVigentes';
import { useEstudiantesVigentes } from '../../../../shared/hooks/useEstudiantesVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import type { Asesor } from '../../../../shared/models/Asesor';
import type { EstudianteVigente } from '../../../../shared/models/EstudianteVigente';

vi.mock('../../hooks/useRegistrarFichaPerfil', () => ({ useRegistrarFichaPerfil: vi.fn() }));
vi.mock('../../../../shared/hooks/useAsesoresFichaVigentes', () => ({
  useAsesoresFichaVigentes: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useEstudiantesVigentes', () => ({
  useEstudiantesVigentes: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useRegistrarMock = vi.mocked(useRegistrarFichaPerfil);
const useAsesoresMock = vi.mocked(useAsesoresFichaVigentes);
const useEstudiantesMock = vi.mocked(useEstudiantesVigentes);

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const E1: EstudianteVigente = { id: 'e-1', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };
const E2: EstudianteVigente = { id: 'e-2', nombre: 'Marta Ríos', email: 'marta@uco.edu.co' };
const E3: EstudianteVigente = { id: 'e-3', nombre: 'Pedro Soto', email: 'pedro@uco.edu.co' };

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
    data: [E1, E2, E3],
    isLoading: false,
    isError: false,
    ...estudiantes,
  } as ReturnType<typeof useEstudiantesVigentes>);
}

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useRegistrarMock.mockReturnValue({
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
  } as ReturnType<typeof useRegistrarFichaPerfil>);
  return mutate;
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

const DIALOGO_DESCARTAR = { name: '¿Descartar los cambios?' };

describe('RegistrarFichaPerfilPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    mockCatalogos();
    mockMutacion();
  });

  it('abre un diálogo modal con el foco dentro y el formulario con nombre accesible', () => {
    // Act
    render(<RegistrarFichaPerfilPanel onCerrar={vi.fn()} />);

    // Assert
    const dialogo = screen.getByRole('dialog', { name: 'Nueva ficha de perfil' });
    expect(dialogo).toBeInTheDocument();
    expect(dialogo.contains(document.activeElement)).toBe(true);
    expect(
      within(dialogo).getByRole('textbox', { name: /Título del proyecto/ }),
    ).toBeInTheDocument();
  });

  it('muestra el error del título al salir del campo vacío, sin mostrarlo al montar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegistrarFichaPerfilPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.queryByText('Este campo es requerido')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('textbox', { name: /Título del proyecto/ }));
    await user.tab();

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Este campo es requerido');
  });

  it('enviar con errores muestra el resumen, enfoca el primer campo y no registra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    render(<RegistrarFichaPerfilPanel onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar ficha' }));

    // Assert
    expect(await screen.findByText('Revisa 3 campos antes de continuar')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Título del proyecto/ })).toHaveFocus();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('con datos válidos registra con el mapeo correcto, notifica y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockMutacion(
      vi.fn((_req: unknown, opciones?: { onSuccess?: () => void }) => opciones?.onSuccess?.()),
    );
    render(<RegistrarFichaPerfilPanel onCerrar={onCerrar} />);

    // Act
    await llenarFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Registrar ficha' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { tituloProyecto: 'Sistema nuevo', asesorFichaId: 'a-1', estudiantesIds: ['e-1'] },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Ficha de perfil registrada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('si el backend rechaza el registro notifica el error, conserva los datos y no cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockMutacion(
      vi.fn((_req: unknown, opciones?: { onError?: (e: unknown) => void }) =>
        opciones?.onError?.(crearErrorApi('ASESOR_NO_VIGENTE', 'El asesor ya no está vigente')),
      ),
    );
    render(<RegistrarFichaPerfilPanel onCerrar={onCerrar} />);

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
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('un título duplicado se pinta bajo el campo además del único toast', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(
      vi.fn((_req: unknown, opciones?: { onError?: (e: unknown) => void }) =>
        opciones?.onError?.(crearErrorApi('FICHA_TITULO_DUPLICADO', 'Ya existe una ficha así')),
      ),
    );
    render(<RegistrarFichaPerfilPanel onCerrar={vi.fn()} />);

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
    render(<RegistrarFichaPerfilPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('note', { name: `No disponible: ${recurso}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar ficha' })).toBeDisabled();
  });

  it('al elegir el máximo de estudiantes deshabilita el campo y avisa', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RegistrarFichaPerfilPanel onCerrar={vi.fn()} />);

    // Act
    for (const nombre of [/Luis Gómez/, /Marta Ríos/, /Pedro Soto/]) {
      await user.click(screen.getByRole('combobox', { name: 'Estudiantes' }));
      await user.click(screen.getByRole('option', { name: nombre }));
    }

    // Assert
    expect(screen.getByText('Alcanzaste el máximo.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Estudiantes' })).toBeDisabled();
  });

  it('cerrar sin cambios llama onCerrar sin pedir confirmación', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<RegistrarFichaPerfilPanel onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog', DIALOGO_DESCARTAR)).not.toBeInTheDocument();
  });

  it('cancelar con cambios pide confirmación: Seguir editando conserva y Descartar cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<RegistrarFichaPerfilPanel onCerrar={onCerrar} />);
    await user.type(screen.getByRole('textbox', { name: /Título del proyecto/ }), 'Borrador');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    const dialogo = screen.getByRole('dialog', DIALOGO_DESCARTAR);
    await user.click(within(dialogo).getByRole('button', { name: 'Seguir editando' }));

    // Assert
    expect(screen.queryByRole('dialog', DIALOGO_DESCARTAR)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Título del proyecto/ })).toHaveValue('Borrador');
    expect(onCerrar).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('Esc con la lista abierta cierra solo la lista y el siguiente Esc cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<RegistrarFichaPerfilPanel onCerrar={onCerrar} />);
    await user.click(screen.getByRole('combobox', { name: 'Asesor' }));
    expect(screen.getByRole('option', { name: /Ana Pérez/ })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('option', { name: /Ana Pérez/ })).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('Esc con cambios pide confirmación en lugar de cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<RegistrarFichaPerfilPanel onCerrar={onCerrar} />);
    await user.type(screen.getByRole('textbox', { name: /Título del proyecto/ }), 'Borrador');

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('dialog', DIALOGO_DESCARTAR)).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('mientras envía deshabilita el botón de cierre, muestra el estado y Esc no cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockMutacion(vi.fn(), true);
    render(<RegistrarFichaPerfilPanel onCerrar={onCerrar} />);

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Registrando/ })).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
