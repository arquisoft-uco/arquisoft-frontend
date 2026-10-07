import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import Combobox, { type OpcionCombobox } from './Combobox';

const OPCIONES: OpcionCombobox[] = [
  { id: '1', etiqueta: 'Ángela Muñoz', descripcion: 'angela@uco.edu.co' },
  { id: '2', etiqueta: 'Luis Gómez', descripcion: 'luis@uco.edu.co' },
  { id: '3', etiqueta: 'Marta Ríos', descripcion: 'marta@uco.edu.co' },
];

interface PropsMultiple {
  max?: number;
  inicial?: string[];
  onBlur?: () => void;
  alPulsarEnPadre?: () => void;
}

function Multiple({ max, inicial = [], onBlur, alPulsarEnPadre }: PropsMultiple) {
  const [valor, setValor] = useState<string[]>(inicial);
  return (
    <div onKeyDown={alPulsarEnPadre}>
      <label htmlFor="estudiantes">Estudiantes</label>
      <Combobox
        id="estudiantes"
        multiple
        max={max}
        valor={valor}
        onCambiar={setValor}
        opciones={OPCIONES}
        textoVacio="No hay coincidencias."
        etiquetaElegidos="Estudiantes elegidos"
        onBlur={onBlur}
      />
    </div>
  );
}

function Unico({ inicial = '' }: { inicial?: string }) {
  const [valor, setValor] = useState(inicial);
  return (
    <>
      <label htmlFor="asesor">Asesor</label>
      <Combobox
        id="asesor"
        valor={valor}
        onCambiar={setValor}
        opciones={OPCIONES}
        textoVacio="No hay coincidencias."
        etiquetaElegidos="Asesor elegido"
      />
      <p>Valor: {valor || 'ninguno'}</p>
    </>
  );
}

const campo = () => screen.getByRole('combobox', { name: 'Estudiantes' });

describe('Combobox', () => {
  it('filtra sin tildes ni mayúsculas por nombre y por correo, y muestra el texto vacío sin coincidencias', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Multiple />);

    // Act
    await user.type(campo(), 'ANGELA');

    // Assert
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: /Ángela Muñoz/ })).toBeInTheDocument();

    // Act
    await user.clear(campo());
    await user.type(campo(), 'luis@');

    // Assert
    expect(screen.getByRole('option', { name: /Luis Gómez/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Ángela/ })).not.toBeInTheDocument();

    // Act
    await user.clear(campo());
    await user.type(campo(), 'zzz');

    // Assert
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('No hay coincidencias.')).toBeInTheDocument();
  });

  it('elige con teclado y con clic, muestra el contador y permite quitar con la equis', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Multiple max={3} />);

    // Act
    await user.click(campo());
    await user.keyboard('{ArrowDown}{Enter}');
    await user.click(await screen.findByRole('option', { name: /Marta Ríos/ }));

    // Assert
    const elegidos = screen.getByRole('list', { name: 'Estudiantes elegidos' });
    expect(within(elegidos).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('2 de 3')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar a Luis Gómez' }));

    // Assert
    expect(within(elegidos).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
    expect(campo()).toHaveFocus();
  });

  it('lo ya elegido aparece como Agregada y no se puede volver a elegir', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Multiple inicial={['2']} />);

    // Act
    await user.click(campo());
    const agregada = screen.getByRole('option', { name: /Luis Gómez/ });
    await user.click(agregada);

    // Assert
    expect(agregada).toHaveAttribute('aria-disabled', 'true');
    expect(within(agregada).getByText('Agregada')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('al llegar al máximo deshabilita el campo, avisa y lleva el foco a la equis de la última fila', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Multiple max={2} inicial={['1']} />);

    // Act
    await user.click(campo());
    await user.click(screen.getByRole('option', { name: /Luis Gómez/ }));

    // Assert
    expect(campo()).toBeDisabled();
    expect(screen.getByText('Alcanzaste el máximo.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar a Luis Gómez' })).toHaveFocus();

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar a Luis Gómez' }));

    // Assert
    expect(campo()).toBeEnabled();
  });

  it('las flechas abren y mueven la opción activa, Inicio y Fin saltan a los extremos', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Multiple />);
    const idActivo = () => campo().getAttribute('aria-activedescendant');
    const activa = () => screen.getByRole('option', { selected: true });

    // Act
    campo().focus();
    await user.keyboard('{ArrowDown}');

    // Assert
    expect(campo()).toHaveAttribute('aria-expanded', 'true');
    expect(activa()).toHaveTextContent('Ángela Muñoz');
    expect(idActivo()).toBe(activa().id);

    // Act
    await user.keyboard('{ArrowDown}');

    // Assert
    expect(activa()).toHaveTextContent('Luis Gómez');
    expect(idActivo()).toBe(activa().id);

    // Act
    await user.keyboard('{End}');

    // Assert
    expect(activa()).toHaveTextContent('Marta Ríos');

    // Act
    await user.keyboard('{Home}');

    // Assert
    expect(activa()).toHaveTextContent('Ángela Muñoz');
  });

  it('Esc con la lista abierta cierra solo la lista; con la lista cerrada llega al padre', async () => {
    // Arrange
    const user = userEvent.setup();
    const alPulsarEnPadre = vi.fn();
    render(<Multiple alPulsarEnPadre={alPulsarEnPadre} />);
    await user.click(campo());

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(campo()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(alPulsarEnPadre).toHaveBeenCalledTimes(1);
    expect(alPulsarEnPadre.mock.calls[0][0].defaultPrevented).toBe(true);

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(alPulsarEnPadre).toHaveBeenCalledTimes(2);
    expect(alPulsarEnPadre.mock.calls[1][0].defaultPrevented).toBe(false);
  });

  it('elegir con el ratón no hace perder el foco ni dispara onBlur', async () => {
    // Arrange
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<Multiple onBlur={onBlur} />);

    // Act
    await user.click(campo());
    await user.click(screen.getByRole('option', { name: /Marta Ríos/ }));

    // Assert
    expect(campo()).toHaveFocus();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it('en modo único la elección se ve como tarjeta y Cambiar vacía el valor y enfoca el campo', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Unico />);

    // Act
    await user.click(screen.getByRole('combobox', { name: 'Asesor' }));
    await user.click(screen.getByRole('option', { name: /Luis Gómez/ }));

    // Assert
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('Valor: 2')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Asesor' }));

    // Assert
    expect(screen.getByText('Valor: ninguno')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Asesor' })).toHaveFocus();
  });
});
