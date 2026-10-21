import type { FormEvent } from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import Button from './Button';

describe('Button', () => {
  it('no envía el formulario que lo contiene salvo que se le pida type="submit"', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn((evento: FormEvent) => evento.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </form>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onSubmit).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('con cargando se deshabilita, se marca como ocupado y deja de disparar onClick', async () => {
    // Arrange
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Guardar</Button>);
    const boton = screen.getByRole('button', { name: 'Guardar' });

    // Act
    await user.click(boton);

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(boton).toBeEnabled();
    expect(boton).not.toHaveAttribute('aria-busy');

    // Act
    rerender(
      <Button cargando onClick={onClick}>
        Guardar
      </Button>,
    );
    await user.click(boton);

    // Assert
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
