import { describe, it, expect, vi } from 'vitest';
import { iniciarDescarga } from './iniciar-descarga';

describe('iniciarDescarga', () => {
  it('hace clic en un ancla con el enlace recibido y la retira del documento', () => {
    // Arrange
    let href = '';
    let rel = '';
    let enDocumento = false;
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      href = this.href;
      rel = this.rel;
      enDocumento = document.body.contains(this);
    });

    // Act
    iniciarDescarga('https://s3.test/archivo?firma=x');

    // Assert
    expect(clic).toHaveBeenCalledTimes(1);
    expect(href).toBe('https://s3.test/archivo?firma=x');
    expect(rel).toBe('noopener');
    expect(enDocumento).toBe(true);
    expect(document.querySelector('a')).toBeNull();
    clic.mockRestore();
  });
});
