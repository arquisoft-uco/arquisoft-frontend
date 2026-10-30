import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import type { EstadoAsesorProyectoGrado } from '../../models/EstadoAsesorProyectoGrado';
import EstadosAsesorProyectoGradoTable from './EstadosAsesorProyectoGradoTable';

const ESTADOS: EstadoAsesorProyectoGrado[] = [
  { id: 'ASIGNADO', nombre: 'Asignado', descripcion: 'El asesor está actualmente activo.' },
  { id: 'FINALIZADO', nombre: 'Finalizado', descripcion: 'El asesor ha concluido.' },
];

describe('EstadosAsesorProyectoGradoTable', () => {
  it('con estados muestra el nombre y la descripción de cada uno', () => {
    // Arrange / Act
    render(<EstadosAsesorProyectoGradoTable estados={ESTADOS} cargando={false} />);

    // Assert
    expect(
      screen.getByRole('table', { name: 'Estados posibles de un asesor del proyecto de grado' }),
    ).toBeInTheDocument();
    for (const estado of ESTADOS) {
      expect(screen.getAllByText(estado.nombre).length).toBeGreaterThan(0);
      expect(screen.getAllByText(estado.descripcion).length).toBeGreaterThan(0);
    }
  });

  it('con lista vacía muestra el estado vacío', () => {
    // Arrange / Act
    render(<EstadosAsesorProyectoGradoTable estados={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Aún no hay estados de asesor')).toBeInTheDocument();
  });
});
