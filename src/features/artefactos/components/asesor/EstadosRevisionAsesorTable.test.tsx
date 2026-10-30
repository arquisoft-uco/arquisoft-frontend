import { describe, it, expect } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import EstadosRevisionAsesorTable from './EstadosRevisionAsesorTable';

const ESTADOS: EstadoRevisionAsesor[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Nueva revisión elaborada por el asesor' },
  { id: 'EN_PROGRESO', nombre: 'En progreso', descripcion: 'El estudiante inició los ajustes' },
  { id: 'RESUELTA', nombre: 'Resuelta', descripcion: 'El estudiante finalizó los ajustes' },
  { id: 'CERRADA', nombre: 'Cerrada', descripcion: 'El asesor cerró la revisión' },
];

describe('EstadosRevisionAsesorTable', () => {
  it('muestra nombre y descripción de cada estado en el orden recibido', () => {
    // Arrange / Act
    render(<EstadosRevisionAsesorTable estados={ESTADOS} cargando={false} />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Estados de una revisión del asesor' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(ESTADOS.length);
    filas.forEach((fila, i) => {
      expect(within(fila).getByText(ESTADOS[i].nombre)).toBeInTheDocument();
      expect(within(fila).getByText(ESTADOS[i].descripcion)).toBeInTheDocument();
    });
  });

  it('con lista vacía muestra el título del estado vacío', () => {
    // Arrange / Act
    render(<EstadosRevisionAsesorTable estados={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Aún no hay estados de revisión')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
