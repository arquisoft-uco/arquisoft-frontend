import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import Tabs from './Tabs';

type Clave = 'uno' | 'dos' | 'tres';

const TABS: { key: Clave; label: string }[] = [
  { key: 'uno', label: 'Uno' },
  { key: 'dos', label: 'Dos' },
  { key: 'tres', label: 'Tres' },
];

function TabsControladas({ inicial = 'uno' }: { inicial?: Clave }) {
  const [activa, setActiva] = useState<Clave>(inicial);
  return (
    <Tabs tabs={TABS} activa={activa} onCambiar={setActiva} ariaLabel="Secciones" idBase="t">
      <p>Contenido de {activa}</p>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('expone tablist, una tab por pestaña y el panel de la activa enlazado por ARIA', () => {
    render(
      <Tabs tabs={TABS} activa="dos" onCambiar={vi.fn()} ariaLabel="Secciones" idBase="t">
        <p>Contenido dos</p>
      </Tabs>,
    );

    expect(screen.getByRole('tablist', { name: 'Secciones' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    const activa = screen.getByRole('tab', { name: 'Dos' });
    expect(activa).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Uno' })).toHaveAttribute('aria-selected', 'false');
    const panel = screen.getByRole('tabpanel');
    expect(activa).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', activa.id);
    expect(panel).toHaveTextContent('Contenido dos');
  });

  it('llama onCambiar con la clave de la pestaña pulsada', async () => {
    const onCambiar = vi.fn();
    const user = userEvent.setup();
    render(
      <Tabs tabs={TABS} activa="uno" onCambiar={onCambiar} ariaLabel="Secciones" idBase="t">
        <p>Contenido</p>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Tres' }));

    expect(onCambiar).toHaveBeenCalledWith('tres');
  });

  it('navega con flechas con envoltura y con Home/End, moviendo el foco a la pestaña activa', async () => {
    const user = userEvent.setup();
    render(<TabsControladas />);

    screen.getByRole('tab', { name: 'Uno' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Tres' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Tres' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Uno' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Contenido de uno');

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Tres' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Uno' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Uno' })).toHaveAttribute('aria-selected', 'true');
  });
});
