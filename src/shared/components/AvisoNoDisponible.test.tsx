import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils/render';
import AvisoNoDisponible from './AvisoNoDisponible';

describe('AvisoNoDisponible', () => {
  it('se anuncia como alerta accesible', () => {
    render(<AvisoNoDisponible recurso="asesores" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('nombra el recurso no disponible', () => {
    render(<AvisoNoDisponible recurso="estudiantes" />);
    expect(screen.getByRole('alert')).toHaveTextContent(/estudiantes/);
    expect(screen.getByRole('alert')).toHaveTextContent(/no está disponible/);
  });
});
