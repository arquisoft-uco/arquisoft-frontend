import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import EnlaceVersionesArtefacto from './EnlaceVersionesArtefacto';

describe('EnlaceVersionesArtefacto', () => {
  it('apunta al listado de versiones filtrado por el artefacto', () => {
    // Arrange
    // Act
    render(
      <EnlaceVersionesArtefacto
        artefactoId="a-1"
        nombreDocumento="Acta de inicio"
        vista="versiones-revisiones"
      />,
      { initialPath: '/artefactos' },
    );

    // Assert
    expect(screen.getByRole('link', { name: 'Ver versiones de Acta de inicio' })).toHaveAttribute(
      'href',
      '/artefactos?vista=versiones-revisiones&artefacto=a-1',
    );
  });

  it('conserva el estado del proyecto de la URL actual', () => {
    // Arrange
    // Act
    render(
      <EnlaceVersionesArtefacto
        artefactoId="a-1"
        nombreDocumento="Acta de inicio"
        vista="versiones-artefactos"
      />,
      { initialPath: '/artefactos?estadoProyecto=cancelados&q=acta' },
    );

    // Assert
    expect(screen.getByRole('link', { name: 'Ver versiones de Acta de inicio' })).toHaveAttribute(
      'href',
      '/artefactos?vista=versiones-artefactos&artefacto=a-1&estadoProyecto=cancelados',
    );
  });
});
