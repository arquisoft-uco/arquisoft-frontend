import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { EstudianteProyectoGrado } from '../../models/EstudianteProyectoGrado';
import { proyectosGradoService } from '../../services/proyectosGradoService';
import EstudiantesProyectoGradoPanel from './EstudiantesProyectoGradoPanel';

vi.mock('../../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getEstudiantesProyecto: vi.fn(),
  },
}));

const consultar = vi.mocked(proyectosGradoService.getEstudiantesProyecto);

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

function renderizar(onCerrar = vi.fn()) {
  render(
    <EstudiantesProyectoGradoPanel proyectoGradoId="p-1" titulo="Sistema" onCerrar={onCerrar} />,
  );
  return onCerrar;
}

describe('EstudiantesProyectoGradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
