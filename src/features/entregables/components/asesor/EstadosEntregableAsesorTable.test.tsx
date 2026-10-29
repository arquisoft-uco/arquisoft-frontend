import { describe, it, expect } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import type { EstadoEntregable } from '../../models/entregables';
import EstadosEntregableAsesorTable from './EstadosEntregableAsesorTable';

const ESTADOS: EstadoEntregable[] = [
  { id: 'APROBADO', nombre: 'Aprobado', descripcion: 'El entregable fue aprobado' },
  { id: 'RECHAZADO', nombre: 'Rechazado', descripcion: 'El entregable fue rechazado' },
];

describe('EstadosEntregableAsesorTable', () => {
  it('muestra el nombre y la descripción de cada estado', () => {
    // Arrange / Act
    render(<EstadosEntregableAsesorTable estados={ESTADOS} cargando={false} />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Estados de un entregable' });
    expect(within(tabla).getByText('Aprobado')).toBeInTheDocument();
    expect(within(tabla).getByText('El entregable fue aprobado')).toBeInTheDocument();
    expect(within(tabla).getByText('Rechazado')).toBeInTheDocument();
    expect(within(tabla).getByText('El entregable fue rechazado')).toBeInTheDocument();
  });

  it('con la lista vacía muestra el estado vacío', () => {
    // Arrange / Act
    render(<EstadosEntregableAsesorTable estados={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Aún no hay estados de entregable')).toBeInTheDocument();
  });
});
