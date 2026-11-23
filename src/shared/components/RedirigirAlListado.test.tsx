import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores } from '../../test-utils/store.utils';
import { useToastStore } from '../stores/toastStore';
import RedirigirAlListado from './RedirigirAlListado';

function Volver() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      Atrás
    </button>
  );
}

function arbol() {
  return (
    <Routes>
      <Route path="/" element={<Link to="/detalle">Abrir detalle</Link>} />
      <Route path="/detalle" element={<RedirigirAlListado destino="/listado" />} />
      <Route
        path="/listado"
        element={
          <>
            <p>Listado</p>
            <Volver />
          </>
        }
      />
    </Routes>
  );
}

describe('RedirigirAlListado', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('lleva al listado con replace: «Atrás» regresa a la pantalla anterior y no al detalle vacío', async () => {
    // Arrange
    const user = userEvent.setup();
    render(arbol());

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir detalle' }));

    // Assert
    expect(screen.getByText('Listado')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Atrás' }));

    // Assert
    expect(screen.getByRole('link', { name: 'Abrir detalle' })).toBeInTheDocument();
  });

  it('avisa una sola vez con un toast informativo, también bajo StrictMode', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StrictMode>{arbol()}</StrictMode>);

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir detalle' }));

    // Assert
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      level: 'info',
      title: 'Abre el detalle desde el listado',
    });
  });
});
