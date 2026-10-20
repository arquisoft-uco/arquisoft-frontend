import { describe, expect, it } from 'vitest';
import { temaSecurityUi } from './tema-security-ui';

describe('temaSecurityUi', () => {
  it('deriva acento, tipografía y radio de los tokens del proyecto', () => {
    // Arrange
    const estilos = document.createElement('div').style;
    estilos.setProperty('--color-primary', ' oklch(0.5 0.1 200) ');
    estilos.setProperty('--radius-lg', '0.5rem ');
    estilos.fontFamily = 'Inter';

    // Act
    const tema = temaSecurityUi(estilos);

    // Assert
    expect(tema).toEqual({ accent: 'oklch(0.5 0.1 200)', fontFamily: 'Inter', radius: '0.5rem' });
  });
});
