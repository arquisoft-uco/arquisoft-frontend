import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import EstudianteDetalleView from './EstudianteDetalleView';
import type { NavegacionDetalleProyecto } from '../models/ResumenProyectoGrado';

const NAVEGACION: NavegacionDetalleProyecto = {
  search: '?proyecto=p-1',
  resumen: {
    id: 'p-1',
    titulo: 'Sistema de monitoreo',
    estadoId: 'EN_CURSO',
    estadoNombre: 'En curso',
  },
};

describe('EstudianteDetalleView', () => {
  it('muestra la miga con la search recibida, la pestaña y el resumen del estado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Routes>
        <Route
          path="/"
          element={
            <Link to="/proyectos-grado/p-1" state={NAVEGACION}>
              Abrir
            </Link>
          }
        />
        <Route path="/proyectos-grado/:id" element={<EstudianteDetalleView />} />
      </Routes>,
    );

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Assert
    expect(screen.getByRole('link', { name: 'Proyectos de grado' })).toHaveAttribute(
      'href',
      '/proyectos-grado?proyecto=p-1',
    );
    expect(screen.getByRole('link', { name: 'Historial de estados' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sistema de monitoreo' })).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
  });
});
