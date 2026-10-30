import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import Field from './Field';
import SelectorArchivo from './SelectorArchivo';

function renderizar(archivo: File | null, deshabilitado = false) {
  const onElegir = vi.fn();
  render(
    <Field etiqueta="Archivo">
      {(control) => (
        <SelectorArchivo
          control={control}
          archivo={archivo}
          onElegir={onElegir}
          acepta=".pdf"
          deshabilitado={deshabilitado}
        />
      )}
    </Field>,
  );
  return onElegir;
}

describe('SelectorArchivo', () => {
  it('al elegir un archivo lo notifica', async () => {
    // Arrange
    const user = userEvent.setup();
    const archivo = new File(['contenido'], 'guia.pdf', { type: 'application/pdf' });
    const onElegir = renderizar(null);

    // Act
    await user.upload(screen.getByLabelText('Archivo', { selector: 'input' }), archivo);

    // Assert
    expect(onElegir).toHaveBeenCalledWith(archivo);
  });

  it('muestra el nombre y el tamaño del archivo elegido', () => {
    // Act
    renderizar(new File(['contenido'], 'guia.pdf', { type: 'application/pdf' }));

    // Assert
    expect(screen.getByText(/guia\.pdf · /)).toBeInTheDocument();
  });

  it('deshabilitado no permite elegir', () => {
    // Act
    renderizar(null, true);

    // Assert
    expect(screen.getByLabelText('Archivo', { selector: 'input' })).toBeDisabled();
  });
});
