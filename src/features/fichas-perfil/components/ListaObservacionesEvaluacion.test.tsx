import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import type { ObservacionEvaluacion } from '../models/ObservacionEvaluacion';
import ListaObservacionesEvaluacion from './ListaObservacionesEvaluacion';

const OBSERVACIONES = [
  { id: 'o-1', observacion: 'Primera línea\nSegunda línea' },
  { id: 'o-2', observacion: 'Precisar la metodología' },
] as ObservacionEvaluacion[];

describe('ListaObservacionesEvaluacion', () => {
  it('sin callbacks muestra una fila por observación y ningún botón', () => {
    // Act
    render(<ListaObservacionesEvaluacion observaciones={OBSERVACIONES} />);

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(/Primera línea/).textContent).toBe('Primera línea\nSegunda línea');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('con onEliminar ofrece un botón por fila e invoca el callback con esa fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEliminar = vi.fn();
    render(<ListaObservacionesEvaluacion observaciones={OBSERVACIONES} onEliminar={onEliminar} />);

    // Act
    const botones = screen.getAllByRole('button', { name: 'Eliminar observación' });
    await user.click(botones[1]);

    // Assert
    expect(botones).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Editar observación' })).not.toBeInTheDocument();
    expect(onEliminar).toHaveBeenCalledWith(OBSERVACIONES[1]);
  });
});
