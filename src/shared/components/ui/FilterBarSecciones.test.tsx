import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import FilterBar from './FilterBar';
import type { SeccionFiltro } from './FilterBar';

const OPCIONES = [
  { id: 'a', etiqueta: 'Aprobada' },
  { id: 'b', etiqueta: 'Borrador' },
];

function renderizar(
  secciones: SeccionFiltro[],
  aplicados = [{ id: 'x', etiqueta: 'X', onQuitar: vi.fn() }],
) {
  render(
    <FilterBar
      busqueda={{ valor: '', onCambiar: vi.fn(), etiqueta: 'Buscar', placeholder: 'Buscar' }}
      popover={{ secciones }}
      aplicados={aplicados}
      onLimpiar={vi.fn()}
    />,
  );
}

async function abrirPanel(user: ReturnType<typeof usarTemporizadoresFalsos>) {
  await user.click(screen.getByRole('button', { name: /^filtros/i }));
  return within(screen.getByRole('dialog', { name: 'Filtros' }));
}

describe('secciones de FilterBar', () => {
  afterEach(() => {
    restaurarTemporizadores();
  });

  it('la sección de texto emite a los 300 ms y no antes', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onCambiar = vi.fn();
    renderizar([
      { id: 'asesor', tipo: 'texto', etiqueta: 'Nombre del asesor', valor: '', onCambiar },
    ]);
    const panel = await abrirPanel(user);

    // Act
    await user.type(panel.getByRole('textbox', { name: 'Nombre del asesor' }), 'Ana');

    // Assert
    expect(onCambiar).not.toHaveBeenCalled();

    // Act
    avanzar(300);

    // Assert
    expect(onCambiar).toHaveBeenCalledTimes(1);
    expect(onCambiar).toHaveBeenCalledWith('Ana');
  });

  it('un valor externo distinto reemplaza el borrador de la sección de texto sin reemitirlo', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onCambiar = vi.fn();
    function crear(valor: string) {
      return (
        <FilterBar
          busqueda={{ valor: '', onCambiar: vi.fn(), etiqueta: 'Buscar', placeholder: 'Buscar' }}
          popover={{
            secciones: [
              { id: 'asesor', tipo: 'texto', etiqueta: 'Nombre del asesor', valor, onCambiar },
            ],
          }}
          aplicados={[]}
          onLimpiar={vi.fn()}
        />
      );
    }
    const { rerender } = render(crear('Ana'));
    const panel = await abrirPanel(user);
    expect(panel.getByRole('textbox', { name: 'Nombre del asesor' })).toHaveValue('Ana');

    // Act
    rerender(crear('Luis'));
    avanzar(300);

    // Assert
    expect(screen.getByRole('textbox', { name: 'Nombre del asesor' })).toHaveValue('Luis');
    expect(onCambiar).not.toHaveBeenCalled();
  });

  it('la sección múltiple alterna cada opción con aria-pressed', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onAlternar = vi.fn();
    renderizar([
      {
        id: 'estado',
        tipo: 'multiple',
        etiqueta: 'Estado',
        opciones: OPCIONES,
        valores: ['a'],
        onAlternar,
        onLimpiar: vi.fn(),
      },
    ]);
    const grupo = within((await abrirPanel(user)).getByRole('group', { name: 'Estado' }));

    // Act
    await user.click(grupo.getByRole('button', { name: 'Borrador' }));

    // Assert
    expect(grupo.getByRole('button', { name: 'Aprobada' })).toHaveAttribute('aria-pressed', 'true');
    expect(grupo.getByRole('button', { name: 'Borrador' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(onAlternar).toHaveBeenCalledWith('b');
  });

  it('deshabilitada bloquea las opciones y muestra el aviso', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    renderizar([
      {
        id: 'estado',
        tipo: 'multiple',
        etiqueta: 'Estado',
        opciones: OPCIONES,
        valores: [],
        onAlternar: vi.fn(),
        onLimpiar: vi.fn(),
        deshabilitada: true,
        aviso: <p>Catálogo no disponible</p>,
      },
    ]);
    const panel = await abrirPanel(user);

    // Assert
    expect(panel.getByRole('button', { name: 'Aprobada' })).toBeDisabled();
    expect(panel.getByText('Catálogo no disponible')).toBeInTheDocument();
  });

  it('"Limpiar" llama a onLimpiar de la múltiple y vacía la de texto y la de opciones', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onLimpiar = vi.fn();
    const onTexto = vi.fn();
    const onOpciones = vi.fn();
    renderizar([
      { id: 't', tipo: 'texto', etiqueta: 'Correo', valor: 'a@', onCambiar: onTexto },
      {
        id: 'm',
        tipo: 'multiple',
        etiqueta: 'Estado',
        opciones: OPCIONES,
        valores: ['a'],
        onAlternar: vi.fn(),
        onLimpiar,
      },
      { id: 'o', etiqueta: 'Vigencia', opciones: OPCIONES, valor: 'a', onCambiar: onOpciones },
    ]);
    const panel = await abrirPanel(user);

    // Act
    await user.click(panel.getByRole('button', { name: 'Limpiar' }));

    // Assert
    expect(onLimpiar).toHaveBeenCalledTimes(1);
    expect(onTexto).toHaveBeenCalledWith('');
    expect(onOpciones).toHaveBeenCalledWith('');
  });
});
