import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { AxiosError, type AxiosResponse } from 'axios';
import { render, screen, within } from '../../../test-utils/render';
import type { ProyectoGrado } from '../models/ProyectoGrado';
import type { EstudianteAsesoradoProyectoGrado } from '../models/EstudianteAsesoradoProyectoGrado';
import AsesorDetalleView from './AsesorDetalleView';
import PestanaResumenAsesor from './asesor/PestanaResumenAsesor';

const { detalle, estudiantes, resumen } = vi.hoisted(() => ({
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

function renderizar() {
  return render(
    <Routes>
      <Route path="/proyectos-grado/:id" element={<AsesorDetalleView />}>
        <Route path="resumen" element={<PestanaResumenAsesor />} />
      </Route>
      <Route path="/proyectos-grado" element={<p>Listado de proyectos</p>} />
    </Routes>,
    { initialPath: '/proyectos-grado/p-1/resumen' },
  );
}

describe('AsesorDetalleView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resumen.mockReturnValue({ resumen: null, search: '?q=monitoreo' });
    estudiantesCon({ data: [ANA] });
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

  it('muestra la pestaña Resumen activa en la barra de secciones', () => {
    // Arrange
    detalleCon({ data: PROYECTO });

    // Act
    renderizar();

    // Assert
    const barra = screen.getByRole('navigation', { name: 'Secciones del proyecto de grado' });
    const enlace = within(barra).getByRole('link', { name: 'Resumen' });
    expect(enlace).toHaveAttribute('aria-current', 'page');
    expect(enlace).toHaveAttribute('href', '/proyectos-grado/p-1/resumen');
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
