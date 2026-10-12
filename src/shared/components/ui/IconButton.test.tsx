import { describe, it, expect } from 'vitest';
import { Reply } from 'lucide-react';
import { render, screen } from '../../../test-utils/render';
import IconButton from './IconButton';

describe('IconButton', () => {
  it('con rótulo muestra el texto visible sin cambiar el nombre accesible del botón', () => {
    // Arrange / Act
    render(
      <IconButton etiqueta="Responder la solicitud de Ana" icono={Reply} rotulo="Responder" />,
    );

    // Assert
    expect(
      screen.getByRole('button', { name: 'Responder la solicitud de Ana' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Responder')).toHaveAttribute('aria-hidden', 'true');
  });

  it('sin rótulo no pinta ningún texto dentro del botón', () => {
    // Arrange / Act
    render(<IconButton etiqueta="Cerrar" icono={Reply} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveTextContent(/^$/);
  });
});
