import { describe, it, expect } from 'vitest';
import { LIMITES } from '../../../shared/validation';
import type { VersionRepositorioArtefacto } from '../../../shared/models/VersionRepositorioArtefacto';
import { nombresDeDocumento, sugerirNombreDocumento } from './documentos-version';

function version(nombreDocumento: string, numeroVersion: number): VersionRepositorioArtefacto {
  return {
    id: `${nombreDocumento}-${numeroVersion}`,
    nombreDocumento,
    numeroVersion,
    fechaCreacion: '2026-03-15T14:30:00Z',
    tipoContenido: 'application/pdf',
    tamanoBytes: 1,
    nombreArchivo: 'a.pdf',
  };
}

describe('documentos-version', () => {
  it('nombresDeDocumento devuelve los nombres únicos y ordenados', () => {
    // Act
    const nombres = nombresDeDocumento([
      version('Zeta', 1),
      version('Álbum', 1),
      version('Zeta', 2),
    ]);

    // Assert
    expect(nombres).toEqual(['Álbum', 'Zeta']);
  });

  it('sugerirNombreDocumento quita la extensión y recorta al máximo', () => {
    // Assert
    expect(sugerirNombreDocumento('Manual de usuario.pdf')).toBe('Manual de usuario');
    expect(sugerirNombreDocumento('.oculto')).toBe('.oculto');
    expect(sugerirNombreDocumento(`${'a'.repeat(150)}.docx`)).toHaveLength(
      LIMITES.VERSION_NOMBRE_DOCUMENTO_MAX,
    );
  });
});
