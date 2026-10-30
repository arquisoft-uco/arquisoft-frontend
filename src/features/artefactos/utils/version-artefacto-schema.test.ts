import { describe, it, expect } from 'vitest';
import { LIMITES } from '../../../shared/validation';
import { versionArtefactoSchema } from './version-artefacto-schema';

function archivoDe(nombre: string, tamano = 1) {
  return new File([new Uint8Array(tamano)], nombre);
}

const esValido = (archivo: File | null) => versionArtefactoSchema.safeParse({ archivo }).success;

describe('versionArtefactoSchema', () => {
  it('acepta las extensiones del artefacto y rechaza archivo ausente, extensión, vacío, tamaño y nombre inválidos', () => {
    // Assert
    expect(esValido(archivoDe('informe.pdf'))).toBe(true);
    expect(esValido(archivoDe('notas.md'))).toBe(true);
    expect(esValido(archivoDe('diagrama.drawio'))).toBe(true);
    expect(esValido(null)).toBe(false);
    expect(esValido(archivoDe('datos.zip'))).toBe(false);
    expect(esValido(archivoDe('vacio.pdf', 0))).toBe(false);
    expect(esValido(archivoDe('grande.pdf', LIMITES.VERSION_ARCHIVO_TAMANO_MAX_BYTES + 1))).toBe(
      false,
    );
    expect(esValido(archivoDe('a/b.pdf'))).toBe(false);
  });
});
