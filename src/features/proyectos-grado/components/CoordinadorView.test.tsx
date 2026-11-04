import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import CoordinadorView from './CoordinadorView';

vi.mock('./coordinador/ConsultarProyectosGradoCoordinador', () => ({
  default: () => <p>Contenido de proyectos</p>,
}));
vi.mock('./coordinador/ConsultarEstadosAsesorProyectoGrado', () => ({
  default: () => <p>Contenido de estados de asesor</p>,
}));

describe('CoordinadorView', () => {
  it('por defecto muestra la sección de proyectos', () => {
    // Arrange / Act
    render(<CoordinadorView />, { initialPath: '/proyectos-grado' });

    // Assert
    expect(screen.getByText('Contenido de proyectos')).toBeInTheDocument();
    expect(screen.queryByText('Contenido de estados de asesor')).not.toBeInTheDocument();
  });

  it('con vista=estados-asesor muestra la sección de estados de asesor', () => {
    // Arrange / Act
    render(<CoordinadorView />, { initialPath: '/proyectos-grado?vista=estados-asesor' });

    // Assert
    expect(screen.getByText('Contenido de estados de asesor')).toBeInTheDocument();
    expect(screen.queryByText('Contenido de proyectos')).not.toBeInTheDocument();
  });

  it('con una vista desconocida cae a la sección de proyectos', () => {
    // Arrange / Act
    render(<CoordinadorView />, { initialPath: '/proyectos-grado?vista=otra' });

    // Assert
    expect(screen.getByText('Contenido de proyectos')).toBeInTheDocument();
  });
});
