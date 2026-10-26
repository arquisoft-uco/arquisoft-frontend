import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { RepositorioArtefacto } from '../../models/RepositorioArtefacto';
import RepositoriosTable from './RepositoriosTable';

const COMPLETO: RepositorioArtefacto = {
  id: 'r-1',
  nombreRepositorio: 'Repositorio Alfa',
  descripcion: 'Artefactos del semillero',
  administrador: {
    id: 'a-1',
    identificador: '1001',
    nombre: 'Ana Pérez',
    email: 'ana@uco.edu.co',
  },
};

function renderizar(props: Partial<React.ComponentProps<typeof RepositoriosTable>> = {}) {
  const onOrdenar = vi.fn();
  const onLimpiarFiltros = vi.fn();
  const resultado = render(
    <RepositoriosTable
      repositorios={[COMPLETO]}
      cargando={false}
      hayFiltros={false}
      orden={{ clave: 'nombreRepositorio', direccion: 'ASC' }}
      onOrdenar={onOrdenar}
      onLimpiarFiltros={onLimpiarFiltros}
      {...props}
    />,
  );
  return { ...resultado, onOrdenar, onLimpiarFiltros };
}

describe('RepositoriosTable', () => {
  it('muestra nombre, descripción y administrador con identificador y correo', () => {
    // Act
    renderizar();

    // Assert
    expect(screen.getAllByText('Repositorio Alfa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Artefactos del semillero').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1001 · ana@uco.edu.co').length).toBeGreaterThan(0);
  });

  it('muestra los textos de respaldo cuando faltan descripción y administrador', () => {
    // Act
    renderizar({ repositorios: [{ id: 'r-2', nombreRepositorio: 'Repositorio Beta' }] });

    // Assert
    expect(screen.getAllByText('Sin descripción').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sin administrador asignado').length).toBeGreaterThan(0);
  });

  it('el nombre es un enlace a las versiones del repositorio', () => {
    // Act
    renderizar();

    // Assert
    expect(
      screen.getAllByRole('link', { name: 'Ver las versiones de Repositorio Alfa' })[0],
    ).toHaveAttribute('href', '/repositorio-artefactos/r-1/versiones');
  });

  it('sin filtros el vacío invita a esperar repositorios', () => {
    // Act
    renderizar({ repositorios: [] });

    // Assert
    expect(screen.getByText('Aún no hay repositorios')).toBeInTheDocument();
  });

  it('con búsqueda el vacío ofrece limpiarla', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ repositorios: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('al pulsar el encabezado Administrador pide ordenar por administradorNombre', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: /Administrador/ }));

    // Assert
    expect(onOrdenar).toHaveBeenCalledWith('administradorNombre', 'ASC');
  });
});
