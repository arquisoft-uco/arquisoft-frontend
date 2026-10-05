import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import Field from './Field';

describe('Field', () => {
  it('vincula la etiqueta con el control y expone la ayuda como su descripción', () => {
    // Act
    render(
      <Field etiqueta="Título" ayuda="Máximo 100 caracteres" opcional>
        {(control) => <input type="text" {...control} />}
      </Field>,
    );

    // Assert
    // dom-accessibility-api recorta el espacio de borde del span «(opcional)»: de ahí el \s*.
    const campo = screen.getByRole('textbox', { name: /^Título\s*\(opcional\)$/ });
    expect(campo).toHaveAccessibleDescription('Máximo 100 caracteres');
    expect(campo).toBeValid();
  });

  it('el error reemplaza a la ayuda, se anuncia como alerta y marca el control como inválido', () => {
    // Act
    render(
      <Field etiqueta="Título" ayuda="Máximo 100 caracteres" error="El título es obligatorio">
        {(control) => <input type="text" {...control} />}
      </Field>,
    );

    // Assert
    const campo = screen.getByRole('textbox', { name: 'Título' });
    expect(screen.getByRole('alert')).toHaveTextContent('El título es obligatorio');
    expect(campo).toBeInvalid();
    expect(campo).toHaveAccessibleDescription('El título es obligatorio');
    expect(screen.queryByText('Máximo 100 caracteres')).not.toBeInTheDocument();
  });

  it('muestra el contador y lo resalta desde el 90 % del máximo', () => {
    // Arrange
    const { rerender } = render(
      <Field etiqueta="Mensaje" contador={{ actual: 89, max: 100 }}>
        {(control) => <textarea {...control} />}
      </Field>,
    );

    // Assert
    expect(screen.getByText('89/100')).not.toHaveClass('font-semibold');

    // Act
    rerender(
      <Field etiqueta="Mensaje" contador={{ actual: 90, max: 100 }}>
        {(control) => <textarea {...control} />}
      </Field>,
    );

    // Assert
    expect(screen.getByText('90/100')).toHaveClass('font-semibold');
  });
});
