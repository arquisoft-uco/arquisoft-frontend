import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import EstadoUltimaRevision from './EstadoUltimaRevision';

function version(estadoRevision: string | null, nombre: string | null): VersionArtefacto {
  return { id: 'v-1', estadoRevision, nombreEstadoRevision: nombre } as VersionArtefacto;
}

describe('EstadoUltimaRevision', () => {
  it('no muestra nada mientras carga ni en un artefacto omitido', () => {
    // Act
    const cargando = render(<EstadoUltimaRevision ultima={undefined} omitido={false} />);
    const omitido = render(<EstadoUltimaRevision ultima={version('CERRADA', 'Cerrada')} omitido />);

    // Assert
    expect(cargando.container).toBeEmptyDOMElement();
    expect(omitido.container).toBeEmptyDOMElement();
  });

  it('sin versiones muestra "Sin versiones"', () => {
    // Act
    render(<EstadoUltimaRevision ultima={null} omitido={false} />);

    // Assert
    expect(screen.getByText('Sin versiones')).toBeInTheDocument();
  });

  it('muestra "Sin revisión" o el nombre del estado tal como viene del backend', () => {
    // Act
    render(
      <>
        <EstadoUltimaRevision ultima={version(null, null)} omitido={false} />
        <EstadoUltimaRevision ultima={version('CERRADA', 'Cerrada')} omitido={false} />
      </>,
    );

    // Assert
    expect(screen.getByText('Sin revisión')).toBeInTheDocument();
    expect(screen.getByText('Cerrada')).toBeInTheDocument();
  });
});
