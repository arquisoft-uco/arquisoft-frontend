import { describe, it, expect } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils/render';
import ComingSoon from './ComingSoon';

describe('ComingSoon', () => {
  it('muestra el aviso y la descripción bajo un único h1 con el título', () => {
    render(<ComingSoon title="Artefactos" description="Gestiona tus artefactos." />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Artefactos' })).toBeInTheDocument();
    expect(screen.getByText('Gestiona tus artefactos.')).toBeInTheDocument();
    expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
  });

  it('«Volver al inicio» navega a /dashboard', async () => {
    const user = userEvent.setup();
    render(
      <Routes>
        <Route path="/artefactos" element={<ComingSoon title="Artefactos" description="d" />} />
        <Route path="/dashboard" element={<p>Pantalla de inicio</p>} />
      </Routes>,
      { initialPath: '/artefactos' },
    );

    await user.click(screen.getByRole('button', { name: 'Volver al inicio' }));

    expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument();
  });
});
