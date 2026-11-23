import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { etiquetaVersionDocumento, SIN_DOCUMENTO_CARGADO } from './version-documento';

const ARTEFACTO = { id: 'a-1', versionDocumento: 3 };
const ULTIMA = { id: 'v-1', version: 2 } as VersionArtefacto;

describe('etiquetaVersionDocumento', () => {
  it('sin versiones cargadas avisa que no hay documento, con o sin sufijo', () => {
    expect(etiquetaVersionDocumento(ARTEFACTO, () => null)).toBe(SIN_DOCUMENTO_CARGADO);
    expect(etiquetaVersionDocumento(ARTEFACTO, () => null, ' del documento')).toBe(
      SIN_DOCUMENTO_CARGADO,
    );
  });

  it('con una versión cargada, o mientras carga, muestra la versión del documento', () => {
    expect(etiquetaVersionDocumento(ARTEFACTO, () => ULTIMA)).toBe('Versión 3');
    expect(etiquetaVersionDocumento(ARTEFACTO, () => ULTIMA, ' del documento')).toBe(
      'Versión 3 del documento',
    );
    expect(etiquetaVersionDocumento(ARTEFACTO, () => undefined)).toBe('Versión 3');
  });
});
