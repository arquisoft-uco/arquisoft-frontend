import { LIMITES } from '../../../shared/validation';
import type { VersionRepositorioArtefacto } from '../models/VersionRepositorioArtefacto';

export function nombresDeDocumento(versiones: VersionRepositorioArtefacto[]): string[] {
  return [...new Set(versiones.map((v) => v.nombreDocumento))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
}

export function sugerirNombreDocumento(nombreArchivo: string): string {
  const punto = nombreArchivo.lastIndexOf('.');
  const base = punto > 0 ? nombreArchivo.slice(0, punto) : nombreArchivo;
  return base.trim().slice(0, LIMITES.VERSION_NOMBRE_DOCUMENTO_MAX);
}
