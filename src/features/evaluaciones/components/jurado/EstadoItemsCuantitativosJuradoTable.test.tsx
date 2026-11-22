import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { ItemCuantitativoJurado } from '../../models/ItemCuantitativoJurado';
import type { ItemEvaluacionJurado } from '../../models/ItemEvaluacionJurado';
import EstadoItemsCuantitativosJuradoTable from './EstadoItemsCuantitativosJuradoTable';

const FILAS: ItemEvaluacionJurado<ItemCuantitativoJurado>[] = [
  {
    item: {
      id: 'i-1',
      nombre: 'Claridad',
      descripcion: 'Del documento',
      categoriaId: 'c',
      valor: 50,
    },
    pendiente: true,
  },
  {
    item: { id: 'i-2', nombre: 'Rigor', descripcion: 'Del método', categoriaId: 'c', valor: 30 },
    pendiente: false,
  },
];

function montar(
  parcial: Partial<React.ComponentProps<typeof EstadoItemsCuantitativosJuradoTable>> = {},
) {
  const onCambiar = vi.fn();
  const onSalirDelCampo = vi.fn();
  render(
    <EstadoItemsCuantitativosJuradoTable
      filas={FILAS}
      cargando={false}
      soloLectura={false}
      deshabilitado={false}
      borrador={{}}
      errores={{}}
      onCambiar={onCambiar}
      onSalirDelCampo={onSalirDelCampo}
      {...parcial}
    />,
  );
  return { onCambiar, onSalirDelCampo, tabla: within(screen.getByRole('table')) };
}

describe('EstadoItemsCuantitativosJuradoTable', () => {
  it('marca «Pendiente» solo en lo que falta y ofrece el puntaje únicamente ahí, con su ayuda', async () => {
    // Arrange
    const user = userEvent.setup();
    const { tabla, onCambiar, onSalirDelCampo } = montar();

    // Assert
    expect(tabla.getAllByText('Pendiente')).toHaveLength(1);
    expect(tabla.getAllByText('Evaluado')).toHaveLength(1);
    expect(tabla.getAllByRole('textbox')).toHaveLength(1);
    expect(tabla.getByRole('textbox', { name: 'Puntaje de Claridad' })).toHaveAccessibleDescription(
      'Entre 0 y 50',
    );

    // Act
    await user.type(tabla.getByRole('textbox', { name: 'Puntaje de Claridad' }), '4');
    await user.tab();

    // Assert
    expect(onCambiar).toHaveBeenCalledWith('i-1', 'puntaje', '4');
    expect(onSalirDelCampo).toHaveBeenCalledWith('i-1');
  });

  it('pinta el error del puntaje y lo enlaza al campo', () => {
    // Arrange / Act
    const { tabla } = montar({
      borrador: { 'i-1': { puntaje: '90', observacion: '' } },
      errores: { 'i-1': { puntaje: 'Debe estar entre 0 y 50' } },
    });

    // Assert
    const campo = tabla.getByRole('textbox', { name: 'Puntaje de Claridad' });
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Debe estar entre 0 y 50');
  });

  it('«Agregar observación» despliega el campo y «Quitar observación» lo borra', async () => {
    // Arrange
    const user = userEvent.setup();
    const { tabla, onCambiar } = montar();

    // Act
    await user.click(tabla.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    expect(tabla.getByRole('textbox', { name: /Observación de Claridad/ })).toBeInTheDocument();
    expect(tabla.getByRole('button', { name: 'Quitar observación' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    // Act
    await user.click(tabla.getByRole('button', { name: 'Quitar observación' }));

    // Assert
    expect(onCambiar).toHaveBeenCalledWith('i-1', 'observacion', '');
    expect(
      tabla.queryByRole('textbox', { name: /Observación de Claridad/ }),
    ).not.toBeInTheDocument();
  });

  it('en solo lectura no ofrece controles', () => {
    // Arrange / Act
    const { tabla } = montar({ soloLectura: true });

    // Assert
    expect(tabla.queryByRole('textbox')).not.toBeInTheDocument();
    expect(tabla.queryByRole('button', { name: /observación/ })).not.toBeInTheDocument();
  });
});
