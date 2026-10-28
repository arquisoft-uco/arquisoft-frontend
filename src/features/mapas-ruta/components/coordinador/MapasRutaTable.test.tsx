import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { MapaRuta } from '../../models/MapaRuta';
import MapasRutaTable from './MapasRutaTable';

const MAPA: MapaRuta = {
  id: 'm-1',
  proyectoGradoId: 'p-1',
  titulo: 'Sistema A',
  fechaInicio: '2026-03-05',
  fechaFin: '2026-08-01',
};

function renderizar(props: Partial<React.ComponentProps<typeof MapasRutaTable>> = {}) {
  const acciones = {
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    onNuevoMapa: vi.fn(),
  };
  render(
    <MapasRutaTable
      mapas={[]}
      cargando={false}
      hayFiltros={false}
      orden={{ clave: 'fechaInicio', direccion: 'DESC' }}
      {...acciones}
      {...props}
    />,
  );
  return acciones;
}

describe('MapasRutaTable', () => {
  it('sin mapas ni filtros ofrece "Nuevo mapa de ruta"', async () => {
    // Arrange
    const { onNuevoMapa } = renderizar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Nuevo mapa de ruta' }));

    // Assert
    expect(screen.getByText('Aún no hay mapas de ruta')).toBeInTheDocument();
    expect(onNuevoMapa).toHaveBeenCalledTimes(1);
  });

  it('sin resultados con filtros ofrece "Limpiar filtros"', async () => {
    // Arrange
    const { onLimpiarFiltros } = renderizar({ hayFiltros: true });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('muestra el título y llama a onOrdenar al pulsar la cabecera de Fin', async () => {
    // Arrange
    const { onOrdenar } = renderizar({ mapas: [MAPA] });

    // Act
    await userEvent.click(screen.getByRole('button', { name: /fin/i }));

    // Assert
    expect(screen.getAllByText('Sistema A').length).toBeGreaterThan(0);
    expect(onOrdenar).toHaveBeenCalledWith('fechaFin', 'ASC');
  });
});
