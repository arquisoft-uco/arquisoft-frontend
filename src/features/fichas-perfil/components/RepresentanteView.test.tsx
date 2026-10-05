import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import RepresentanteView from './RepresentanteView';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';

const FICHA: FichaPerfilRepresentante = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  asesorNombre: 'Ana Pérez',
  asesorEmail: 'ana@uco.edu.co',
  estadoId: 'APROBADA',
  estadoActual: 'Aprobada',
  estadoFechaActualizacion: '2026-10-01T15:30:00Z',
};

vi.mock('./representante/ConsultarFichasRepresentante', () => ({
  default: ({ onSeleccionar }: { onSeleccionar: (ficha: FichaPerfilRepresentante) => void }) => (
    <button type="button" onClick={() => onSeleccionar(FICHA)}>
      Abrir ficha
    </button>
  ),
}));
vi.mock('./representante/DetalleFichaRepresentante', () => ({
  default: ({ ficha, onVolver }: { ficha: FichaPerfilRepresentante; onVolver: () => void }) => (
    <div>
      <p>Detalle de {ficha.titulo}</p>
      <button type="button" onClick={onVolver}>
        Volver
      </button>
    </div>
  ),
}));

describe('RepresentanteView', () => {
  it('muestra el título de la página con el listado', () => {
    // Act
    render(<RepresentanteView />);

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Fichas de perfil a evaluar' }),
    ).toBeInTheDocument();
  });

  it('abre el detalle de la ficha elegida y vuelve al listado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RepresentanteView />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Abrir ficha' }));

    // Assert
    expect(screen.getByText('Detalle de Sistema de monitoreo')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Abrir ficha' })).toBeInTheDocument();
  });
});
