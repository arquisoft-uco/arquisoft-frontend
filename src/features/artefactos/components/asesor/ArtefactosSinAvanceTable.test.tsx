import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { ArtefactoSinAvance } from '../../models/ArtefactoSinAvance';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import ArtefactosSinAvanceTable from './ArtefactosSinAvanceTable';

const BASE: ArtefactoSinAvance = {
  proyectoFinalizado: false,
  proyectoCancelado: false,
  id: '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
};

const ESTADOS: EstadoRevisionAsesor[] = [{ id: 'e-1', nombre: 'Aprobada', descripcion: '' }];

function renderizar(parcial: Partial<React.ComponentProps<typeof ArtefactosSinAvanceTable>> = {}) {
  const props = {
    artefactos: [BASE],
    estados: ESTADOS,
    dias: 15,
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'fechaUltimaVersion', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  render(<ArtefactosSinAvanceTable {...props} />, { initialPath: '/artefactos' });
  return props;
}

describe('ArtefactosSinAvanceTable', () => {
  it('muestra "Sin versiones" y "Sin revisión" cuando faltan la fecha, los días y el estado', () => {
    // Arrange / Act
    renderizar();

    // Assert
    expect(screen.getAllByText('Sin versiones').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Sin revisión').length).toBeGreaterThan(0);
  });

  it('muestra los días y el nombre del estado de la última revisión', () => {
    // Arrange / Act
    renderizar({
      artefactos: [
        {
          ...BASE,
          fechaUltimaVersion: '2026-09-01T10:00:00',
          diasSinAvance: 68,
          estadoUltimaRevision: 'Aprobada',
        },
      ],
    });

    // Assert
    expect(screen.getAllByText('68 días').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Aprobada').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sin versiones')).not.toBeInTheDocument();
  });

  it('sin filtros, el vacío nombra el plazo consultado', () => {
    // Arrange / Act
    renderizar({ artefactos: [], dias: 30 });

    // Assert
    expect(screen.getByText('Ningún artefacto supera 30 días sin avance')).toBeInTheDocument();
  });

  it('con filtros, el vacío ofrece "Limpiar filtros" y lo invoca', async () => {
    // Arrange
    const props = renderizar({ artefactos: [], hayFiltros: true });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(props.onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('muestra la insignia del proyecto cerrado y ninguna en el habilitado', () => {
    // Arrange / Act
    renderizar({
      artefactos: [
        BASE,
        { ...BASE, id: 'a-2', proyectoFinalizado: true },
        { ...BASE, id: 'a-3', proyectoCancelado: true },
      ],
    });

    // Assert
    expect(screen.getAllByText('Proyecto finalizado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Proyecto cancelado').length).toBeGreaterThan(0);
  });
});
