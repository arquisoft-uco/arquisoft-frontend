import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { ItemCuantitativoAsesor } from '../../models/ItemCuantitativoAsesor';
import type { ItemEvaluacion } from '../../models/ItemEvaluacion';
import EstadoItemsCuantitativosAsesorTable from './EstadoItemsCuantitativosAsesorTable';

const FILAS: ItemEvaluacion<ItemCuantitativoAsesor>[] = [
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
  parcial: Partial<React.ComponentProps<typeof EstadoItemsCuantitativosAsesorTable>> = {},
) {
  const onCambiar = vi.fn();
  const onSalirDelCampo = vi.fn();
  render(
    <EstadoItemsCuantitativosAsesorTable
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

describe('EstadoItemsCuantitativosAsesorTable', () => {
  it('marca «Pendiente» solo en lo que falta y ofrece el puntaje únicamente ahí, con su ayuda', async () => {
    // Arrange
    const user = userEvent.setup();
    const { tabla, onCambiar, onSalirDelCampo } = montar();

    // Assert
    expect(tabla.getAllByText('Pendiente')).toHaveLength(1);
    expect(tabla.getAllByText('Evaluado')).toHaveLength(1);
    expect(tabla.getAllByRole('textbox')).toHaveLength(1);
    expect(tabla.queryByRole('button', { name: /observación/i })).not.toBeInTheDocument();
    expect(tabla.getByRole('textbox', { name: 'Puntaje de Claridad' })).toHaveAccessibleDescription(
      'Entre 0 y 50',
    );

    // Act
    await user.type(tabla.getByRole('textbox', { name: 'Puntaje de Claridad' }), '4');
    await user.tab();

    // Assert
    expect(onCambiar).toHaveBeenCalledWith('i-1', '4');
    expect(onSalirDelCampo).toHaveBeenCalledWith('i-1');
  });

  it('pinta el error del puntaje y lo enlaza al campo', () => {
    // Arrange / Act
    const { tabla } = montar({
      borrador: { 'i-1': '90' },
      errores: { 'i-1': 'Debe estar entre 0 y 50' },
    });

    // Assert
    const campo = tabla.getByRole('textbox', { name: 'Puntaje de Claridad' });
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Debe estar entre 0 y 50');
  });

  it('en solo lectura no ofrece controles ni campo para observación', () => {
    // Arrange / Act
    const { tabla } = montar({ soloLectura: true });

    // Assert
    expect(tabla.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
