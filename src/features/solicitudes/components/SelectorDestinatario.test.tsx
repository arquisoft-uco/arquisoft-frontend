import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { render, screen, within } from '../../../test-utils/render';
import SelectorDestinatario from './SelectorDestinatario';
import type { OpcionSelectorDestinatario } from './SelectorDestinatario';
import type { EstadoSelectorDestinatario } from '../utils/estado-selector-destinatario';

const TEXTOS: Record<EstadoSelectorDestinatario, string> = {
  cargando: 'Cargando…',
  vacio: 'Sin opciones',
  error: 'Falló la carga',
  listo: 'Selecciona uno',
};

const OPCIONES: OpcionSelectorDestinatario[] = [
  { clave: 'p1', valor: 'a1', etiqueta: 'Ana — Proyecto uno' },
  { clave: 'p2', valor: 'a1', etiqueta: 'Ana — Proyecto dos' },
];

function Arnes({
  estado,
  opciones = OPCIONES,
}: {
  estado: EstadoSelectorDestinatario;
  opciones?: OpcionSelectorDestinatario[];
}) {
  const { register } = useForm({ defaultValues: { destinatario: '' } });
  return (
    <SelectorDestinatario
      etiqueta="Asesor"
      estado={estado}
      opciones={opciones}
      textos={TEXTOS}
      registro={register('destinatario')}
    />
  );
}

describe('SelectorDestinatario', () => {
  it('muestra el placeholder oculto sin preselección y solo opciones reales al abrir', () => {
    // Arrange
    render(<Arnes estado="listo" opciones={[OPCIONES[0]]} />);

    // Act
    const select = screen.getByLabelText('Asesor') as HTMLSelectElement;
    const placeholder = within(select).getByText('Selecciona uno');

    // Assert
    expect(select.value).toBe('');
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute('hidden');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('con el mismo valor en dos opciones permite elegir la segunda sin keys duplicadas', async () => {
    // Arrange
    const user = userEvent.setup();
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Arnes estado="listo" />);
    const select = screen.getByLabelText('Asesor') as HTMLSelectElement;

    // Act
    await user.selectOptions(select, 'Ana — Proyecto dos');

    // Assert
    expect(select.value).toBe('a1');
    expect(select.selectedIndex).toBe(2);
    expect(consola).not.toHaveBeenCalled();
    consola.mockRestore();
  });

  it.each(['cargando', 'vacio', 'error'] as const)(
    'queda deshabilitado con su texto en estado %s',
    (estado) => {
      // Arrange / Act
      render(<Arnes estado={estado} opciones={[]} />);

      // Assert
      expect(screen.getByLabelText('Asesor')).toBeDisabled();
      expect(within(screen.getByLabelText('Asesor')).getByText(TEXTOS[estado])).toBeInTheDocument();
    },
  );
});
