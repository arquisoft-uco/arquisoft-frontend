import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { AxiosError, type AxiosResponse } from 'axios';
import { render, screen, within } from '../../../test-utils/render';
import type { ProyectoGrado } from '../models/ProyectoGrado';
import type { EstudianteAsesoradoProyectoGrado } from '../models/EstudianteAsesoradoProyectoGrado';
import AsesorDetalleView from './AsesorDetalleView';

const { detalle, estudiantes, resumen, ultimoEntregable, mutar } = vi.hoisted(() => ({
  ultimoEntregable: vi.fn(),
  mutar: vi.fn(),
  detalle: vi.fn(),
  estudiantes: vi.fn(),
  resumen: vi.fn(),
}));

vi.mock('../hooks/useDetalleProyectoGradoAsesor', () => ({
  useDetalleProyectoGradoAsesor: detalle,
}));
vi.mock('../hooks/useEstudiantesAsesoradosProyectoGrado', () => ({
  useEstudiantesAsesoradosProyectoGrado: estudiantes,
}));
vi.mock('../hooks/useUltimoEntregableProyectoGrado', () => ({
  useUltimoEntregableProyectoGrado: ultimoEntregable,
}));
vi.mock('../hooks/useFinalizarProyectoGrado', () => ({
  useFinalizarProyectoGrado: () => ({ mutate: mutar, isPending: false, reset: vi.fn() }),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('../hooks/useResumenProyectoGrado', () => ({
  useResumenProyectoGrado: resumen,
}));

const PROYECTO: ProyectoGrado = {
  id: 'p-1',
  fichaPerfil: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
};
const ANA: EstudianteAsesoradoProyectoGrado = {
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
};

function detalleCon(parcial: Record<string, unknown>) {
  detalle.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  });
}

function estudiantesCon(parcial: Record<string, unknown>) {
  estudiantes.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  });
}

function renderizar(ruta = '/proyectos-grado/p-1') {
  return render(
    <Routes>
      <Route path="/proyectos-grado/:id" element={<AsesorDetalleView />}>
        <Route path="estados" element={<p>Panel de estados</p>} />
      </Route>
      <Route path="/proyectos-grado" element={<p>Listado de proyectos</p>} />
    </Routes>,
    { initialPath: ruta },
  );
}

describe('AsesorDetalleView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resumen.mockReturnValue({ resumen: null, search: '?q=monitoreo' });
    estudiantesCon({ data: [ANA] });
    ultimoEntregable.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('muestra título, estado, miga con la search y los estudiantes con su identificador', () => {
    // Arrange
    detalleCon({ data: PROYECTO });

    // Act
    renderizar();

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sistema de monitoreo' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('En proceso').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Proyectos de grado' })).toHaveAttribute(
      'href',
      '/proyectos-grado?q=monitoreo',
    );
    const panel = within(
      screen.getByRole('complementary', { name: 'Resumen del proyecto de grado' }),
    );
    expect(panel.getByText('Ana Pérez')).toBeInTheDocument();
    expect(panel.getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(panel.getByText('2001')).toBeInTheDocument();
    expect(screen.queryByText('Estudiantes que asesoras')).not.toBeInTheDocument();
  });

  it('con un proyecto EN_PROCESO ofrece «Finalizar proyecto» y con otro estado no muestra «Acciones»', () => {
    // Arrange
    detalleCon({ data: PROYECTO });

    // Act
    const { unmount } = renderizar();

    // Assert
    expect(screen.getByRole('button', { name: 'Finalizar proyecto' })).toBeInTheDocument();
    unmount();

    for (const id of ['ATRASADO', 'FINALIZADO', 'CANCELADO']) {
      // Arrange
      detalleCon({ data: { ...PROYECTO, estado: { id, nombre: id } } });

      // Act
      const { unmount: desmontar } = renderizar();

      // Assert
      expect(screen.queryByRole('button', { name: 'Finalizar proyecto' })).not.toBeInTheDocument();
      expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
      desmontar();
    }
  });

  it('al finalizar vuelve al listado de proyectos', async () => {
    // Arrange
    const user = userEvent.setup();
    mutar.mockImplementation((_req, opciones) => opciones.onSuccess());
    detalleCon({ data: PROYECTO });
    ultimoEntregable.mockReturnValue({
      data: { versionEntregable: 1, estadoEntregable: { id: 'CERRADO', nombre: 'Cerrado' } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Finalizar proyecto' }));
    const dialogo = within(screen.getByRole('alertdialog'));
    await user.type(dialogo.getByRole('textbox'), 'Finalizar proyecto de grado');
    await user.click(dialogo.getByRole('button', { name: 'Finalizar proyecto' }));

    // Assert
    expect(mutar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1' }, expect.any(Object));
    expect(screen.getByText('Listado de proyectos')).toBeInTheDocument();
  });

  it('muestra la pestaña Estados activa con su panel y deja el resumen siempre visible', () => {
    // Arrange
    detalleCon({ data: PROYECTO });

    // Act
    renderizar('/proyectos-grado/p-1/estados');

    // Assert
    expect(screen.getByRole('link', { name: 'Estados' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Panel de estados')).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Resumen del proyecto de grado' }),
    ).toBeInTheDocument();
  });

  it('durante la carga muestra el título provisional del state', () => {
    // Arrange
    resumen.mockReturnValue({
      resumen: { id: 'p-1', titulo: 'Título provisional' },
      search: '',
    });
    detalleCon({ isLoading: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Título provisional' })).toBeInTheDocument();
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('con 422 muestra "no encontrado" y la acción vuelve al listado', async () => {
    // Arrange
    const user = userEvent.setup();
    const respuesta = { status: 422, data: {} } as AxiosResponse;
    detalleCon({
      error: new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, respuesta),
    });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a proyectos de grado' }));

    // Assert
    expect(screen.getByText('Listado de proyectos')).toBeInTheDocument();
  });

  it('con otro error del proyecto ofrece reintentar y lo invoca', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    detalleCon({ error: new Error('fallo'), refetch });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin estudiantes vigentes muestra el vacío y mantiene el resumen', () => {
    // Arrange
    detalleCon({ data: PROYECTO });
    estudiantesCon({ data: [] });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Este proyecto no tiene estudiantes vigentes')).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Resumen del proyecto de grado' }),
    ).toBeInTheDocument();
  });

  it('si fallan los estudiantes muestra error con reintento sin ocultar el proyecto', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    detalleCon({ data: PROYECTO });
    estudiantesCon({ isError: true, error: new Error('fallo'), refetch });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Sistema de monitoreo' })).toBeInTheDocument();
  });
});
