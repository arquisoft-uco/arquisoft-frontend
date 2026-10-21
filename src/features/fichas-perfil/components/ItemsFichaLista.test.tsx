import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import type { Item } from '../models/fichas-perfil';
import ItemsFichaLista from './ItemsFichaLista';

const ITEMS: Item[] = [
  {
    id: 'i-1',
    tipoItem: { id: 't-1', nombre: 'Objetivo General' },
    contenido: 'Contenido uno',
    fichaPerfilId: 'f-1',
  },
  {
    id: 'i-2',
    tipoItem: { id: 't-2', nombre: 'Justificacion' },
    contenido: 'Contenido dos',
    fichaPerfilId: 'f-1',
  },
];

function renderizar(parcial: Partial<React.ComponentProps<typeof ItemsFichaLista>> = {}) {
  return render(
    <ItemsFichaLista
      items={undefined}
      cargando={false}
      error={false}
      onReintentar={vi.fn()}
      {...parcial}
    />,
  );
}

describe('ItemsFichaLista', () => {
  it('muestra la carga accesible', () => {
    // Act
    renderizar({ cargando: true });

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems…');
  });

  it('muestra el vacío cuando no hay ítems', () => {
    // Act
    renderizar({ items: [] });

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene ítems.')).toBeInTheDocument();
  });

  it('muestra el error y "Reintentar" invoca onReintentar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onReintentar = vi.fn();
    renderizar({ error: true, onReintentar });

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los ítems');
    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it('lista cada ítem con su tipo y su contenido', () => {
    // Act
    renderizar({ items: ITEMS });

    // Assert
    expect(screen.getByRole('list', { name: 'Ítems de la ficha' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Objetivo General')).toBeInTheDocument();
    expect(screen.getByText('Contenido dos')).toBeInTheDocument();
  });

  it('con items sin definir y sin error ni carga pinta el esqueleto, nunca el vacío', () => {
    // Act
    renderizar({ items: undefined });

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems…');
    expect(screen.queryByText('Esta ficha aún no tiene ítems.')).not.toBeInTheDocument();
  });

  it('usa el vacío propio cuando se pasa y las acciones se pintan por tarjeta', () => {
    // Act
    const { rerender } = renderizar({ items: [], vacio: <p>Sin ítems propios</p> });

    // Assert
    expect(screen.getByText('Sin ítems propios')).toBeInTheDocument();
    expect(screen.queryByText('Esta ficha aún no tiene ítems.')).not.toBeInTheDocument();

    // Act
    rerender(
      <ItemsFichaLista
        items={ITEMS}
        cargando={false}
        error={false}
        onReintentar={vi.fn()}
        acciones={(item) => <button type="button">Acción {item.id}</button>}
      />,
    );

    // Assert
    expect(screen.getByRole('button', { name: 'Acción i-1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción i-2' })).toBeInTheDocument();
  });

  it('pinta las insignias extra de cada ítem y sin la prop no aparece ninguna', () => {
    // Act
    const { rerender } = renderizar({
      items: ITEMS,
      insignias: (item) => (item.id === 'i-1' ? <span>Insignia i-1</span> : null),
    });

    // Assert
    expect(screen.getByText('Insignia i-1')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('Insignia i-2')).not.toBeInTheDocument();

    // Act
    rerender(
      <ItemsFichaLista items={ITEMS} cargando={false} error={false} onReintentar={vi.fn()} />,
    );

    // Assert
    expect(screen.queryByText('Insignia i-1')).not.toBeInTheDocument();
    expect(screen.getByText('Objetivo General')).toBeInTheDocument();
    expect(screen.getByText('Contenido uno')).toBeInTheDocument();
  });
});
