import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { Asesor } from '../../../../shared/models/Asesor';
import type { ResumenFicha } from '../../models/ResumenFicha';
import AccionesFichaCoordinador from './AccionesFichaCoordinador';

vi.mock('./EstudiantesVinculadosPanel', () => ({
  default: ({ fichaId, onCerrar }: { fichaId: string; onCerrar: () => void }) => (
    <div role="dialog" aria-label="Panel de estudiantes">
      <p>Estudiantes de {fichaId}</p>
      <button type="button" onClick={onCerrar}>
        Cerrar estudiantes
      </button>
    </div>
  ),
}));
vi.mock('./CambiarAsesorPanel', () => ({
  default: ({
    asesorActual,
    onAsesorCambiado,
  }: {
    asesorActual: { id?: string };
    onAsesorCambiado: (a: Asesor) => void;
  }) => (
    <div role="dialog" aria-label="Panel de asesor">
      <p>Asesor actual {asesorActual.id}</p>
      <button
        type="button"
        onClick={() => onAsesorCambiado({ id: 'a-2', nombre: 'Luis', email: 'l@uco.edu.co' })}
      >
        Simular cambio
      </button>
    </div>
  ),
}));

const RESUMEN: ResumenFicha = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  estadoId: 'DISPONIBLE_PARA_EVALUACION',
  asesorId: 'a-1',
  asesorNombre: 'Ana',
  asesorEmail: 'ana@uco.edu.co',
};

describe('AccionesFichaCoordinador', () => {
  it('"Ver estudiantes" abre el panel de esa ficha y se puede cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AccionesFichaCoordinador resumen={RESUMEN} onAsesorCambiado={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver estudiantes' }));

    // Assert
    expect(screen.getByText('Estudiantes de f-1')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar estudiantes' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('"Cambiar asesor" abre el panel con el asesor actual y propaga el asesor nuevo', async () => {
    // Arrange
    const user = userEvent.setup();
    const onAsesorCambiado = vi.fn();
    render(<AccionesFichaCoordinador resumen={RESUMEN} onAsesorCambiado={onAsesorCambiado} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));
    await user.click(screen.getByRole('button', { name: 'Simular cambio' }));

    // Assert
    expect(screen.getByText('Asesor actual a-1')).toBeInTheDocument();
    expect(onAsesorCambiado).toHaveBeenCalledWith({
      id: 'a-2',
      nombre: 'Luis',
      email: 'l@uco.edu.co',
    });
  });
});
