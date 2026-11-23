import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../../test-utils/render';
import EvaluarFichaBoton from './EvaluarFichaBoton';

describe('EvaluarFichaBoton', () => {
  it('al hacer clic navega a la pestaña Evaluaciones de la ficha', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Routes>
        <Route path="/origen" element={<EvaluarFichaBoton fichaPerfilId="f-1" />} />
        <Route path="/fichas-perfil/f-1/evaluaciones" element={<div>Pestaña evaluaciones</div>} />
      </Routes>,
      { initialPath: '/origen' },
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Evaluar ficha' }));

    // Assert
    expect(screen.getByText('Pestaña evaluaciones')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Evaluar ficha' })).not.toBeInTheDocument();
  });
});
