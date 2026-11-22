import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import type { ItemEvaluacion } from '../models/ItemEvaluacion';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import EstadoItemsCualitativosTable from './EstadoItemsCualitativosTable';

const CRITERIOS = [
  { id: 'c-1', nombre: 'Excelente', descripcion: 'Supera lo esperado' },
  { id: 'c-2', nombre: 'Aceptable', descripcion: 'Cumple lo esperado' },
];

const FILAS: ItemEvaluacion<ItemCualitativoJurado>[] = [
  {
    item: { id: 'i-1', nombre: 'Claridad', descripcion: 'Del documento', peso: 10 },
    pendiente: true,
  },
  { item: { id: 'i-2', nombre: 'Orden', descripcion: 'De las ideas', peso: 5 }, pendiente: false },
];

function montar(parcial: Partial<React.ComponentProps<typeof EstadoItemsCualitativosTable>> = {}) {
  const onCambiar = vi.fn();
  render(
    <EstadoItemsCualitativosTable
      filas={FILAS}
      criterios={CRITERIOS}
      cargando={false}
      soloLectura={false}
      deshabilitado={false}
      borrador={{}}
      onCambiar={onCambiar}
      {...parcial}
    />,
  );
  return { onCambiar, tabla: within(screen.getByRole('table')) };
}

describe('EstadoItemsCualitativosTable', () => {
  it('marca «Pendiente» solo en lo que falta y ofrece el selector únicamente ahí', async () => {
    // Arrange
    const user = userEvent.setup();
    const { tabla, onCambiar } = montar({ borrador: { 'i-1': 'c-2' } });

    // Assert
    expect(tabla.getAllByText('Pendiente')).toHaveLength(1);
    expect(tabla.getAllByText('Evaluado')).toHaveLength(1);
    expect(tabla.getAllByRole('combobox')).toHaveLength(1);
    expect(tabla.getByRole('combobox', { name: 'Criterio para Claridad' })).toHaveValue('c-2');
    expect(tabla.getByText('Ya evaluado: ver en Realizadas')).toBeInTheDocument();

    // Act
    await user.selectOptions(
      tabla.getByRole('combobox', { name: 'Criterio para Claridad' }),
      'c-1',
    );

    // Assert
    expect(onCambiar).toHaveBeenCalledWith('i-1', 'c-1');
  });

  it('en solo lectura conserva las insignias y no ofrece controles', () => {
    // Arrange / Act
    const { tabla } = montar({ soloLectura: true });

    // Assert
    expect(tabla.getByText('Pendiente')).toBeInTheDocument();
    expect(tabla.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con catálogo vacío muestra el vacío explicativo', () => {
    // Arrange / Act
    render(
      <EstadoItemsCualitativosTable
        filas={[]}
        criterios={CRITERIOS}
        cargando={false}
        soloLectura={false}
        deshabilitado={false}
        borrador={{}}
        onCambiar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Aún no hay ítems cualitativos')).toBeInTheDocument();
  });
});
