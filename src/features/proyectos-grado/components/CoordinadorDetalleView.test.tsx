import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Navigate, Route, Routes } from 'react-router';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import CoordinadorDetalleView from './CoordinadorDetalleView';

vi.mock('./coordinador/EstudiantesProyectoGradoPanel', () => ({ default: () => null }));

function crearState(estadoId: string, estadoNombre: string) {
  return {
    search: '?q=monitoreo',
    resumen: { id: 'p-1', titulo: 'Sistema de monitoreo', estadoId, estadoNombre },
  };
}

const state = crearState('EN_PROCESO', 'En proceso');

function renderizar(initialPath: string, stateEnlace = state, entrada?: string) {
  return render(
    <Routes>
      {entrada && (
        <Route path="/entrada" element={<Navigate to={entrada} replace state={stateEnlace} />} />
      )}
      <Route
        path="/proyectos-grado"
        element={
          <Link to="/proyectos-grado/p-1/asesores" state={stateEnlace}>
            Abrir proyecto
          </Link>
        }
      />
      <Route path="/proyectos-grado/:id" element={<CoordinadorDetalleView />}>
        <Route path="asesores" element={<p>Panel de asesores</p>} />
        <Route path="estados" element={<p>Panel de estados</p>} />
      </Route>
    </Routes>,
    { initialPath },
  );
}

function renderizarConContexto(rutaDetalle: string) {
  return renderizar('/entrada', state, rutaDetalle);
}

describe('CoordinadorDetalleView', () => {
  beforeEach(() => {
    resetAllStores();
  });

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
    expect(within(resumen).getByRole('button', { name: 'Ver estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Proyectos de grado' })).toHaveAttribute(
      'href',
      '/proyectos-grado?q=monitoreo',
    );
    expect(screen.getByRole('link', { name: 'Asesores' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Panel de asesores')).toBeInTheDocument();
  });

  it('sin state ni snapshot redirige al listado de proyectos', () => {
    // Act
    renderizar('/proyectos-grado/p-1/asesores');

    // Assert
    expect(screen.getByRole('link', { name: 'Abrir proyecto' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Proyecto de grado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver estudiantes' })).not.toBeInTheDocument();
  });

  it('sin state pero con snapshot vigente pinta el detalle con la miga que restaura la search', () => {
    // Arrange
    renderizarConContexto('/proyectos-grado/p-1/asesores').unmount();

    // Act
    renderizar('/proyectos-grado/p-1/asesores');

    // Assert
    expect(screen.getByRole('heading', { name: 'Sistema de monitoreo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Proyectos de grado' })).toHaveAttribute(
      'href',
      '/proyectos-grado?q=monitoreo',
    );
  });

  it('muestra las pestañas Asesores y Estados y marca como activa la de la URL', () => {
    // Act
    renderizarConContexto('/proyectos-grado/p-1/estados');

    // Assert
    expect(screen.getByRole('link', { name: 'Asesores' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Estados' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Panel de estados')).toBeInTheDocument();
  });

  it('con un proyecto EN_PROCESO ofrece cancelarlo y con uno CANCELADO no, manteniendo «Ver estudiantes»', async () => {
    // Arrange
    const user = userEvent.setup();
    const { unmount } = renderizar('/proyectos-grado');

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir proyecto' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Cancelar proyecto' })).toBeInTheDocument();

    // Act
    unmount();
    renderizar('/proyectos-grado', crearState('CANCELADO', 'Cancelado'));
    await user.click(screen.getByRole('link', { name: 'Abrir proyecto' }));

    // Assert
    expect(screen.queryByRole('button', { name: 'Cancelar proyecto' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver estudiantes' })).toBeInTheDocument();
  });
});
