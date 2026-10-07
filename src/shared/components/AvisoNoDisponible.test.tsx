import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils/render';
import AvisoNoDisponible from './AvisoNoDisponible';

describe('AvisoNoDisponible', () => {
  it('se anuncia como nota accesible con el recurso en su nombre', () => {
    render(<AvisoNoDisponible recurso="asesores" />);
    expect(screen.getByRole('note', { name: 'No disponible: asesores' })).toBeInTheDocument();
  });

  it('muestra una sola frase, sin nombrar el recurso', () => {
    render(<AvisoNoDisponible recurso="estudiantes" />);
    expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
    expect(screen.queryByText(/estudiantes/)).not.toBeInTheDocument();
  });
});
