import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import LineaTiempo from './LineaTiempo';
import type { PasoLineaTiempo } from './LineaTiempo';

const PASOS: PasoLineaTiempo[] = [
  { id: 'B', nombre: 'En curso', variante: 'exito', fecha: '2026-03-02T10:00:00Z' },
  { id: 'A', nombre: 'Creado', variante: 'neutro', fecha: 'no-es-fecha' },
];

describe('LineaTiempo', () => {
  it('lista los pasos con su etiqueta, marca solo el primero como actual y formatea las fechas', () => {
    // Arrange / Act
    const { container } = render(<LineaTiempo pasos={PASOS} etiqueta="Historial de prueba" />);

    // Assert
    expect(screen.getByRole('list', { name: 'Historial de prueba' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getAllByText('Actual')).toHaveLength(1);
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(container.querySelectorAll('time')).toHaveLength(1);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
