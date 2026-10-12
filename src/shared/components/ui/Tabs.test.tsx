import { forwardRef, useState } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import Tabs from './Tabs';
import type { ItemPestana } from './ContenidoPestana';

type Seccion = 'datos' | 'items' | 'historial';

type CasoDeTeclado = [descripcion: string, inicial: Seccion, tecla: string, destino: string];

const ETIQUETA = 'Secciones de la ficha';

const ITEMS: { id: Seccion; etiqueta: string }[] = [
  { id: 'datos', etiqueta: 'Datos' },
  { id: 'items', etiqueta: 'Ítems' },
  { id: 'historial', etiqueta: 'Historial' },
];

const IconoDePrueba: LucideIcon = forwardRef<SVGSVGElement, Omit<LucideProps, 'ref'>>(
  (props, ref) => <svg ref={ref} role="img" aria-label="Icono de prueba" {...props} />,
);

const CASOS_DE_TECLADO: CasoDeTeclado[] = [
  [
    'la flecha derecha avanza una pestaña y desde la última vuelve a la primera',
    'items',
    '{ArrowRight}{ArrowRight}',
    'Datos',
  ],
  [
    'la flecha izquierda retrocede una pestaña y desde la primera vuelve a la última',
    'items',
    '{ArrowLeft}{ArrowLeft}',
    'Historial',
  ],
  ['Fin lleva el foco y la selección a la última pestaña', 'datos', '{End}', 'Historial'],
  ['Inicio lleva el foco y la selección a la primera pestaña', 'historial', '{Home}', 'Datos'],
];

function TabsControlado({ inicial }: { inicial: Seccion }) {
  const [valor, setValor] = useState<Seccion>(inicial);
  return <Tabs items={ITEMS} valor={valor} etiqueta={ETIQUETA} onCambiar={setValor} />;
}

describe('Tabs', () => {
  it('selecciona solo la pestaña activa y es la única a la que llega el Tab', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} valor="items" etiqueta={ETIQUETA} />);

    // Assert
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Ítems');

    // Act
    await user.tab();

    // Assert
    expect(screen.getByRole('tab', { name: 'Ítems' })).toHaveFocus();

    // Act
    await user.tab();

    // Assert
    expect(document.body).toHaveFocus();
  });

  it.each(CASOS_DE_TECLADO)('%s', async (_descripcion, inicial, tecla, destino) => {
    // Arrange
    const user = userEvent.setup();
    render(<TabsControlado inicial={inicial} />);
    await user.tab();

    // Act
    await user.keyboard(tecla);

    // Assert
    const pestana = screen.getByRole('tab', { name: destino });
    expect(pestana).toHaveFocus();
    expect(screen.getByRole('tab', { selected: true })).toBe(pestana);
  });

  it('llama a onCambiar con el id de la pestaña pulsada', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCambiar = vi.fn();
    render(<Tabs items={ITEMS} valor="datos" etiqueta={ETIQUETA} onCambiar={onCambiar} />);

    // Act
    await user.click(screen.getByRole('tab', { name: 'Historial' }));

    // Assert
    expect(onCambiar).toHaveBeenCalledTimes(1);
    expect(onCambiar).toHaveBeenCalledWith('historial');
  });

  it('asocia el panel con la pestaña activa', () => {
    // Act
    render(
      <Tabs items={ITEMS} valor="items" etiqueta={ETIQUETA}>
        <p>Lista de ítems</p>
      </Tabs>,
    );

    // Assert
    const panel = screen.getByRole('tabpanel', { name: 'Ítems' });
    expect(panel).toHaveTextContent('Lista de ítems');
    expect(screen.getByRole('tab', { name: 'Ítems' })).toHaveAttribute('aria-controls', panel.id);
    expect(screen.getByRole('tab', { name: 'Datos' })).not.toHaveAttribute('aria-controls');
  });

  it('con idBase y paneles del consumidor, cada pestaña apunta al panel con su id derivado', () => {
    // Act
    render(
      <>
        <Tabs items={ITEMS} valor="datos" etiqueta={ETIQUETA} idBase="ficha" />
        {ITEMS.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`ficha-panel-${item.id}`}
            aria-labelledby={`ficha-pestana-${item.id}`}
          />
        ))}
      </>,
    );

    // Assert
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    for (const item of ITEMS) {
      const pestana = screen.getByRole('tab', { name: item.etiqueta });
      expect(pestana).toHaveAttribute('aria-controls', `ficha-panel-${item.id}`);
      expect(pestana).toHaveAttribute('id', `ficha-pestana-${item.id}`);
    }
  });

  it('en modo navegación marca con aria-current solo el valor y no usa roles de pestaña', () => {
    // Arrange
    const itemsConRuta = ITEMS.map((item) => ({ ...item, to: `/ficha/${item.id}` }));

    // Act
    render(<Tabs items={itemsConRuta} valor="items" etiqueta={ETIQUETA} />, {
      initialPath: '/ficha/items',
    });

    // Assert
    const navegacion = screen.getByRole('navigation', { name: ETIQUETA });
    expect(within(navegacion).getAllByRole('link')).toHaveLength(3);
    expect(within(navegacion).getByRole('link', { current: 'page' })).toHaveTextContent('Ítems');
    expect(within(navegacion).getByRole('link', { name: 'Datos' })).toHaveAttribute(
      'href',
      '/ficha/datos',
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('el icono de una pestaña es decorativo: no cambia su nombre accesible y las demás no lo traen', () => {
    // Arrange
    const itemsConIcono: ItemPestana<Seccion>[] = ITEMS.map((item) =>
      item.id === 'datos' ? { ...item, icono: IconoDePrueba } : item,
    );

    // Act
    render(<Tabs items={itemsConIcono} valor="datos" etiqueta={ETIQUETA} />);

    // Assert
    const conIcono = screen.getByRole('tab', { name: 'Datos' });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(within(conIcono).getByRole('img', { hidden: true })).toBeInTheDocument();
    expect(
      within(screen.getByRole('tab', { name: 'Ítems' })).queryByRole('img', { hidden: true }),
    ).not.toBeInTheDocument();
  });
});
