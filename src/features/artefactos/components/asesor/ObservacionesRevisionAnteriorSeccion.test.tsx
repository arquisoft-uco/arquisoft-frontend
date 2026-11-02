import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { RevisionAnterior } from '../../hooks/useRevisionAnterior';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import ObservacionesRevisionAnteriorSeccion from './ObservacionesRevisionAnteriorSeccion';

vi.mock('../../hooks/useRevisionAnterior', () => ({ useRevisionAnterior: vi.fn() }));

const ANTERIOR_V = { id: 'v-2', artefacto: 'a-1', version: 2 } as VersionArtefacto;

const solucionada: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-2',
  descripcion: 'Corregir la portada',
  estadoId: 'SOLUCIONADA',
  estadoNombre: 'Solucionada',
};
const nueva: ObservacionRevision = {
  ...solucionada,
  id: 'o-2',
  descripcion: 'Falta el diagrama',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
};

function anterior(parcial: Partial<RevisionAnterior> = {}): RevisionAnterior {
  return {
    visible: true,
    versionAnterior: ANTERIOR_V,
    observaciones: [solucionada, nueva],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    total: 2,
    sinCerrar: 2,
    puedeDecidir: true,
    situacion: 'disponible',
    textoAviso: null,
    ...parcial,
  } as RevisionAnterior;
}

describe('ObservacionesRevisionAnteriorSeccion', () => {
  it('no se renderiza si no es visible', () => {
    // Act
    const { container } = render(
      <ObservacionesRevisionAnteriorSeccion
        anterior={anterior({ visible: false })}
        onDecidir={vi.fn()}
      />,
    );

    // Assert
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra título, contador y una tarjeta por observación', () => {
    // Act
    render(<ObservacionesRevisionAnteriorSeccion anterior={anterior()} onDecidir={vi.fn()} />);

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Observaciones de la revisión anterior' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 de 2 sin cerrar')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('solo la observación solucionada tiene menú y entrega versión, observación y estado', async () => {
    // Arrange
    const onDecidir = vi.fn();
    const user = userEvent.setup();
    render(<ObservacionesRevisionAnteriorSeccion anterior={anterior()} onDecidir={onDecidir} />);

    // Act
    await user.click(screen.getByRole('button', { name: /^Acciones de la observación:/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar observación' }));

    // Assert
    expect(screen.queryAllByRole('button', { name: /^Acciones de la observación:/ })).toHaveLength(
      1,
    );
    expect(onDecidir).toHaveBeenCalledWith(ANTERIOR_V, solucionada, 'CERRADA');
  });

  it('con la reapertura bloqueada deshabilita reabrir y muestra el aviso', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ObservacionesRevisionAnteriorSeccion
        anterior={anterior({
          situacion: 'sin-version-siguiente',
          textoAviso: 'Para reabrir observaciones, el estudiante debe subir la versión 3.',
        })}
        onDecidir={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: /^Acciones de la observación:/ }));

    // Assert
    expect(screen.getByText(/el estudiante debe subir la versión 3/)).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Reabrir observación' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'Cerrar observación' })).toBeEnabled();
  });

  it('sin puedeDecidir queda en solo lectura, sin menús', () => {
    // Act
    render(
      <ObservacionesRevisionAnteriorSeccion
        anterior={anterior({ puedeDecidir: false })}
        onDecidir={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: /^Acciones de la observación:/ }),
    ).not.toBeInTheDocument();
  });

  it('mientras carga muestra el esqueleto accesible dentro de la sección', () => {
    // Act
    render(
      <ObservacionesRevisionAnteriorSeccion
        anterior={anterior({ observaciones: undefined, isLoading: true })}
        onDecidir={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando observaciones de la revisión anterior…',
    );
    expect(screen.queryByText(/sin cerrar/)).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y Reintentar repite la consulta', async () => {
    // Arrange
    const refetch = vi.fn();
    const user = userEvent.setup();
    render(
      <ObservacionesRevisionAnteriorSeccion
        anterior={anterior({ isError: true, observaciones: undefined, refetch })}
        onDecidir={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});
