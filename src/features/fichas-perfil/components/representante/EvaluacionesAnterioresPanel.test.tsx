import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import EvaluacionesAnterioresPanel from './EvaluacionesAnterioresPanel';

const A: EvaluacionFichaPerfil = {
  id: 'ev-2',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-02',
  estadoEvaluacionId: 'st-1',
  estadoEvaluacionNombre: 'Aprobada',
};
const B: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-01',
  estadoEvaluacionId: null,
  estadoEvaluacionNombre: null,
};

describe('EvaluacionesAnterioresPanel', () => {
  it('sin evaluaciones no renderiza nada', () => {
    // Arrange / Act
    const { container } = render(
      <EvaluacionesAnterioresPanel evaluaciones={[]} onVerObservaciones={vi.fn()} />,
    );

    // Assert
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra estado y fecha de cada una y «Ver observaciones» entrega la evaluación correcta', async () => {
    // Arrange
    const user = userEvent.setup();
    const onVer = vi.fn();
    render(<EvaluacionesAnterioresPanel evaluaciones={[A, B]} onVerObservaciones={onVer} />);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Ver observaciones' })[1]);

    // Assert
    expect(screen.getByText('Evaluaciones anteriores')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.getByText('Sin estado')).toBeInTheDocument();
    expect(onVer).toHaveBeenCalledWith(B);
  });
});
