import { describe, it, expect } from 'vitest';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { accionRevisionDelArtefacto, gestionarRevisionRegistrada } from './accion-revision-asesor';

const SIN_REVISION: VersionArtefacto = {
  id: 'v-2',
  artefacto: 'a-1',
  version: 2,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 1,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
  fechaCreacionRevision: null,
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

function anteriorEn(estado: string): VersionArtefacto {
  return { ...SIN_REVISION, id: 'v-1', version: 1, revisionAsesor: 'r-1', estadoRevision: estado };
}

const BASE = { artefactoOmitido: false, proyectoCerrado: false };

describe('accionRevisionDelArtefacto', () => {
  it('sin versiones, mientras cargan o con el artefacto omitido no ofrece nada', () => {
    expect(accionRevisionDelArtefacto({ ...BASE, ultima: null, anterior: null })).toBeNull();
    expect(
      accionRevisionDelArtefacto({ ...BASE, ultima: undefined, anterior: undefined }),
    ).toBeNull();
    const conRevision = { ...SIN_REVISION, revisionAsesor: 'r-2', estadoRevision: 'PENDIENTE' };
    expect(
      accionRevisionDelArtefacto({
        ...BASE,
        artefactoOmitido: true,
        ultima: conRevision,
        anterior: null,
      }),
    ).toBeNull();
  });

  it('gestiona la revisión de la última versión cuando existe, aunque el proyecto esté cerrado', () => {
    const ultima = { ...SIN_REVISION, revisionAsesor: 'r-2', estadoRevision: 'EN_PROGRESO' };

    expect(
      accionRevisionDelArtefacto({ ...BASE, proyectoCerrado: true, ultima, anterior: null }),
    ).toEqual({ tipo: 'gestionar', version: ultima, revisionAsesorId: 'r-2' });
  });

  it('sin revisión en la última versión, la registra si la anterior está resuelta o no hay anterior', () => {
    const primera = { ...SIN_REVISION, id: 'v-1', version: 1 };

    expect(
      accionRevisionDelArtefacto({
        ...BASE,
        ultima: SIN_REVISION,
        anterior: anteriorEn('RESUELTA'),
      }),
    ).toEqual({ tipo: 'registrar', version: SIN_REVISION });
    expect(accionRevisionDelArtefacto({ ...BASE, ultima: primera, anterior: null })).toEqual({
      tipo: 'registrar',
      version: primera,
    });
  });

  it('si aún no se puede registrar, gestiona la revisión vigente de la versión anterior', () => {
    const enProgreso = anteriorEn('EN_PROGRESO');
    const resuelta = anteriorEn('RESUELTA');

    expect(
      accionRevisionDelArtefacto({ ...BASE, ultima: SIN_REVISION, anterior: enProgreso }),
    ).toEqual({ tipo: 'gestionar', version: enProgreso, revisionAsesorId: 'r-1' });
    expect(
      accionRevisionDelArtefacto({
        ...BASE,
        proyectoCerrado: true,
        ultima: SIN_REVISION,
        anterior: resuelta,
      }),
    ).toEqual({ tipo: 'gestionar', version: resuelta, revisionAsesorId: 'r-1' });
    expect(
      accionRevisionDelArtefacto({
        ...BASE,
        proyectoCerrado: true,
        ultima: { ...SIN_REVISION, version: 1 },
        anterior: null,
      }),
    ).toBeNull();
  });
});

describe('gestionarRevisionRegistrada', () => {
  it('abre la revisión recién registrada como pendiente', () => {
    expect(gestionarRevisionRegistrada(SIN_REVISION, 'r-9')).toEqual({
      tipo: 'gestionar',
      revisionAsesorId: 'r-9',
      version: {
        ...SIN_REVISION,
        revisionAsesor: 'r-9',
        estadoRevision: 'PENDIENTE',
        nombreEstadoRevision: 'Pendiente',
        fechaCreacionRevision: null,
      },
    });
  });
});
