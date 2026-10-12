import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router';
import { render, screen, within } from '../../../test-utils/render';
import CoordinadorDetalleView from './CoordinadorDetalleView';

vi.mock('./coordinador/EstudiantesProyectoGradoPanel', () => ({ default: () => null }));

const state = {
  search: '?q=monitoreo',
  resumen: {
    id: 'p-1',
    titulo: 'Sistema de monitoreo',
    estadoId: 'EN_PROCESO',
    estadoNombre: 'En proceso',
  },
};

function renderizar(initialPath: string) {
  return render(
    <Routes>
      <Route
        path="/proyectos-grado"
        element={
          <Link to="/proyectos-grado/p-1/asesores" state={state}>
            Abrir proyecto
          </Link>
        }
      />
      <Route path="/proyectos-grado/:id" element={<CoordinadorDetalleView />}>
        <Route path="asesores" element={<p>Panel de asesores</p>} />
      </Route>
    </Routes>,
    { initialPath },
  );
}

describe('CoordinadorDetalleView', () => {
  it('con el state del enlace muestra título, el estado una sola vez dentro del resumen y la miga que restaura la search', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/proyectos-grado');

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir proyecto' }));

    // Assert
    expect(screen.getByRole('heading', { name: 'Sistema de monitoreo' })).toBeInTheDocument();
    expect(screen.getAllByText('En proceso')).toHaveLength(1);
    const resumen = screen.getByRole('complementary', { name: 'Resumen del proyecto de grado' });
    expect(within(resumen).getByText('En proceso')).toBeInTheDocument();
    expect(
      within(resumen).getByRole('button', { name: 'Asignar estudiantes' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Proyectos de grado' })).toHaveAttribute(
      'href',
      '/proyectos-grado?q=monitoreo',
    );
    expect(screen.getByRole('link', { name: 'Asesores' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Panel de asesores')).toBeInTheDocument();
  });

  it('sin state muestra la cabecera genérica, el aviso del resumen, el botón de acciones y la miga sin search', () => {
    // Act
    renderizar('/proyectos-grado/p-1/asesores');

    // Assert
    expect(screen.getByRole('heading', { name: 'Proyecto de grado' })).toBeInTheDocument();
    expect(screen.queryByText('En proceso')).not.toBeInTheDocument();
    expect(screen.getByText(/No tenemos el resumen de este proyecto/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Proyectos de grado' })).toHaveAttribute(
      'href',
      '/proyectos-grado',
    );
  });
});
