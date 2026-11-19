import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EnviarCorreccionesRevisionBoton from './EnviarCorreccionesRevisionBoton';

function montar(parcial: Partial<React.ComponentProps<typeof EnviarCorreccionesRevisionBoton>>) {
  const onEnviar = vi.fn();
  render(
    <EnviarCorreccionesRevisionBoton
      idRevision="r-1"
      etiquetaItem="Objetivo general"
      motivo={null}
      cargando={false}
      onEnviar={onEnviar}
      {...parcial}
    />,
  );
  return onEnviar;
}

describe('EnviarCorreccionesRevisionBoton', () => {
  it('sin motivo queda habilitado y al pulsarlo llama a onEnviar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEnviar = montar({});

    // Act
    await user.click(
      screen.getByRole('button', {
        name: 'Enviar correcciones de la revisión de Objetivo general',
      }),
    );

    // Assert
    expect(onEnviar).toHaveBeenCalledTimes(1);
  });

  it('con motivo queda deshabilitado, muestra el texto y queda descrito por él', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEnviar = montar({ motivo: 'Tienes 2 observaciones pendientes: edita el ítem.' });

    // Act
    const boton = screen.getByRole('button', { name: /Enviar correcciones de la revisión/ });
    await user.click(boton);

    // Assert
    expect(boton).toBeDisabled();
    expect(boton).toHaveAccessibleDescription('Tienes 2 observaciones pendientes: edita el ítem.');
    expect(onEnviar).not.toHaveBeenCalled();
  });

  it('en cargando no dispara el envío', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEnviar = montar({ cargando: true });

    // Act
    const boton = screen.getByRole('button', { name: /Enviar correcciones de la revisión/ });
    await user.click(boton);

    // Assert
    expect(boton).toHaveAttribute('aria-busy', 'true');
    expect(onEnviar).not.toHaveBeenCalled();
  });
});
