import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import { useEstudiantesVigentes } from '../../../../shared/hooks/useEstudiantesVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import type { EstudianteVigente } from '../../../../shared/models/EstudianteVigente';
import type { EstudianteProyectoGrado } from '../../models/EstudianteProyectoGrado';
import { proyectosGradoService } from '../../services/proyectosGradoService';
import { useDestitucionEstudiante } from '../../hooks/useDestitucionEstudiante';
import EstudiantesProyectoGradoPanel from './EstudiantesProyectoGradoPanel';

vi.mock('../../hooks/useDestitucionEstudiante', () => ({
  useDestitucionEstudiante: vi.fn(),
}));
vi.mock('../../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getEstudiantesProyecto: vi.fn(),
    asignarEstudiantes: vi.fn(),
  },
}));

vi.mock('../../../../shared/hooks/useEstudiantesVigentes', () => ({
  useEstudiantesVigentes: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const consultar = vi.mocked(proyectosGradoService.getEstudiantesProyecto);
const asignar = vi.mocked(proyectosGradoService.asignarEstudiantes);
const useVigentesMock = vi.mocked(useEstudiantesVigentes);
const useDestitucionMock = vi.mocked(useDestitucionEstudiante);

const solicitar = vi.fn();
const confirmar = vi.fn();
const cancelar = vi.fn();

function mockDestitucion(parcial: Partial<ReturnType<typeof useDestitucionEstudiante>> = {}) {
  useDestitucionMock.mockReturnValue({
    pendiente: null,
    destituyendo: false,
    solicitar,
    confirmar,
    cancelar,
    ...parcial,
  });
}

const NUEVO: EstudianteVigente = { id: 'e-9', nombre: 'Pedro Díaz', email: 'pedro@uco.edu.co' };
type ResultadoVigentes = ReturnType<typeof useEstudiantesVigentes>;

function mockVigentes(parcial: Partial<ResultadoVigentes> = {}) {
  useVigentesMock.mockReturnValue({
    data: [NUEVO],
    isLoading: false,
    isError: false,
    ...parcial,
  } as ResultadoVigentes);
}

function crearErrorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable', errorCode, message: 'x', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function elegirANuevo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('combobox', { name: 'Estudiantes a asignar' }));
  await user.click(await screen.findByRole('option', { name: /Pedro Díaz/ }));
}

const activo: EstudianteProyectoGrado = {
  id: 'ep-1',
  proyectoGradoId: 'p-1',
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  vigente: true,
};
const baja: EstudianteProyectoGrado = {
  ...activo,
  id: 'ep-2',
  estudianteId: 'e-2',
  nombre: 'Marta Ruiz',
  email: 'marta@uco.edu.co',
  vigente: false,
};

function renderizar(onCerrar = vi.fn(), finalizado = false) {
  render(
    <EstudiantesProyectoGradoPanel
      proyectoGradoId="p-1"
      titulo="Sistema"
      finalizado={finalizado}
      onCerrar={onCerrar}
    />,
  );
  return onCerrar;
}

describe('EstudiantesProyectoGradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVigentes();
    mockDestitucion();
    asignar.mockResolvedValue(undefined);
  });

  it('muestra el estado de carga', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => undefined));

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el error y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce([activo]);
    renderizar();
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(await screen.findByText('Luis Gómez')).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('sin estudiantes muestra el estado vacío', async () => {
    // Arrange
    consultar.mockResolvedValue([]);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Aún no hay estudiantes vinculados')).toBeInTheDocument();
  });

  it('lista nombre y correo y marca «Dado de baja» solo al no vigente', async () => {
    // Arrange
    consultar.mockResolvedValue([activo, baja]);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('Marta Ruiz')).toBeInTheDocument();
    expect(screen.getAllByText('Dado de baja')).toHaveLength(1);
  });

  it('«Cerrar» cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue([activo]);
    const onCerrar = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalled();
  });

  it('elige un candidato, envía su id, avisa el éxito y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue([activo]);
    const onCerrar = renderizar();
    await elegirANuevo(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar estudiantes' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(asignar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1', estudiantesIds: ['e-9'] });
    expect(toast.success).toHaveBeenCalledWith('Estudiantes asignados', expect.any(String));
  });

  it('no ofrece como opción a un estudiante ya vinculado y deshabilita el envío sin selección', async () => {
    // Arrange
    const user = userEvent.setup();
    mockVigentes({
      data: [{ id: 'e-1', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' }, NUEVO],
    });
    consultar.mockResolvedValue([activo]);
    renderizar();

    // Act
    await user.click(await screen.findByRole('combobox', { name: 'Estudiantes a asignar' }));

    // Assert
    expect(await screen.findByRole('option', { name: /Pedro Díaz/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Luis Gómez/ })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Asignar estudiantes' }),
    ).toBeDisabled();
  });

  it('con el cupo agotado no hay selector y lo explica', async () => {
    // Arrange
    consultar.mockResolvedValue([activo, baja, { ...activo, id: 'ep-3', estudianteId: 'e-3' }]);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(/ya tiene el máximo de 3 estudiantes/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con el proyecto finalizado no hay formulario y lo explica', async () => {
    // Arrange
    consultar.mockResolvedValue([activo]);

    // Act
    renderizar(vi.fn(), true);

    // Assert
    expect(await screen.findByText(/está finalizado y no admite/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('ante NO_PERTENECE_COORDINADOR muestra el texto propio, no cierra y conserva la selección', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue([activo]);
    asignar.mockRejectedValue(crearErrorApi('PROYECTO_GRADO_NO_PERTENECE_COORDINADOR'));
    const onCerrar = renderizar();
    await elegirANuevo(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar estudiantes' }));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo asignar a los estudiantes',
        'Solo el coordinador asignado a este proyecto puede agregar estudiantes.',
      ),
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByText('Pedro Díaz')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar estudiantes' })).toBeEnabled();
  });

  it('con el catálogo caído muestra el aviso y deja el envío deshabilitado', async () => {
    // Arrange
    mockVigentes({ data: undefined, isError: true });
    consultar.mockResolvedValue([activo]);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(/no está disponible/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar estudiantes' })).toBeDisabled();
  });

  it('«Destituir a X» solicita la destitución de esa fila, también la de «Dado de baja»', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue([activo, baja]);
    renderizar();

    // Act
    await user.click(await screen.findByRole('button', { name: 'Destituir a Marta Ruiz' }));

    // Assert
    expect(solicitar).toHaveBeenCalledWith(baja);
    expect(screen.getByRole('button', { name: 'Destituir a Luis Gómez' })).toBeInTheDocument();
  });

  it('con un pendiente muestra las consecuencias y permite confirmar o cancelar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue([activo]);
    mockDestitucion({ pendiente: activo });
    renderizar();
    expect(await screen.findByText(/Luis Gómez dejará de estar vinculado/)).toBeInTheDocument();
    expect(
      screen.getByText('La vinculación se elimina y no se puede deshacer.'),
    ).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Destituir' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(cancelar).toHaveBeenCalled();
  });

  it('con el proyecto finalizado no ofrece destituir', async () => {
    // Arrange
    consultar.mockResolvedValue([activo]);

    // Act
    renderizar(vi.fn(), true);

    // Assert
    expect(await screen.findByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Destituir a/ })).not.toBeInTheDocument();
  });
});
