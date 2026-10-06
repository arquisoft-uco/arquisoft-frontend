import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AyudaTiposItem from './AyudaTiposItem';

vi.mock('./TiposItemPanel', () => ({ default: () => <div>Catálogo de tipos</div> }));

describe('AyudaTiposItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre el panel lateral con el catálogo, Esc lo cierra y el foco vuelve al enlace', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AyudaTiposItem />);
    const enlace = screen.getByRole('button', { name: '¿Qué tipos de ítem existen?' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    await user.click(enlace);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Tipos de ítem' })).toBeInTheDocument();
    expect(screen.getByText('Catálogo de tipos')).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(enlace).toHaveFocus();
  });
});
