import { describe, expect, it } from 'vitest';

interface Fuente {
  ruta: string;
  contenido: string;
}

// Sin '**': un comodín recursivo escrito así lo cuenta la regla de JSDoc.
const fuentes = import.meta.glob<string>(
  [
    '/src/{,*/,*/*/,*/*/*/,*/*/*/*/,*/*/*/*/*/}*.{ts,tsx}',
    '!/src/{,*/,*/*/,*/*/*/,*/*/*/*/,*/*/*/*/*/}*.d.ts',
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
);

const PATRON_IMPORT =
  /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const CARPETA_KEYCLOAK = 'auth/proveedores/keycloak/';
const CARPETA_PDP = 'auth/proveedores/pdp/';
const REGISTRO = 'auth/proveedores/proveedores';
const ADAPTADOR_KEYCLOAK = 'auth/keycloak';

const esTest = (ruta: string) => /\.test\.tsx?$/.test(ruta);

const produccion: Fuente[] = Object.entries(fuentes)
  .map(([ruta, contenido]) => ({ ruta: ruta.slice('/src/'.length), contenido }))
  .filter(({ ruta }) => !esTest(ruta) && !ruta.startsWith('test-utils/'));

function resolverRelativa(origen: string, especificador: string): string {
  const partes = origen.split('/').slice(0, -1);
  for (const parte of especificador.split('/')) {
    if (parte === '..') partes.pop();
    else if (parte !== '.') partes.push(parte);
  }
  return partes.join('/');
}

function importsDe({ ruta, contenido }: Fuente): string[] {
  return [...contenido.matchAll(PATRON_IMPORT)].map((coincidencia) => {
    const especificador = coincidencia[1] ?? coincidencia[2] ?? coincidencia[3];
    return especificador.startsWith('.') ? resolverRelativa(ruta, especificador) : especificador;
  });
}

function quitarComentarios(contenido: string): string {
  return contenido.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function archivosQueImportan(destino: (importado: string) => boolean, permitidos: string[]) {
  return produccion
    .filter(({ ruta }) => !permitidos.includes(ruta))
    .filter((fuente) => importsDe(fuente).some(destino))
    .map(({ ruta }) => ruta);
}

function archivosQueContienen(patron: RegExp, permitidos: string[]) {
  return produccion
    .filter(({ ruta }) => !permitidos.includes(ruta))
    .filter(({ contenido }) => patron.test(quitarComentarios(contenido)))
    .map(({ ruta }) => ruta);
}

describe('Desacople de proveedores de identidad (HT-015)', () => {
  it('D-1: solo la implementación Keycloak usa keycloak-js, su adaptador y su configuración', () => {
    const importadores = archivosQueImportan(
      (i) => i === 'keycloak-js' || i === ADAPTADOR_KEYCLOAK,
      ['auth/keycloak.ts', `${CARPETA_KEYCLOAK}keycloakProveedor.ts`],
    );
    const configuracion = archivosQueContienen(/\bKEYCLOAK_CONFIG\b/, [
      'auth/keycloak.ts',
      'config/env.ts',
    ]);

    expect([...importadores, ...configuracion]).toEqual([]);
  });

  it('D-2: solo la implementación PDP y el registro conocen al PDP y sus rutas', () => {
    const importadores = archivosQueImportan(
      (i) => i === `${CARPETA_PDP}pdpProveedor`,
      [`${REGISTRO}.ts`],
    );
    const usos = archivosQueContienen(/\bPDP_CONFIG\b|api\/v1\/session|oauth2\/authorization/, [
      `${CARPETA_PDP}pdpProveedor.ts`,
      `${REGISTRO}.ts`,
      'config/env.ts',
    ]);

    expect([...importadores, ...usos]).toEqual([]);
  });

  it('D-3: ningún consumidor importa una implementación concreta', () => {
    const infractores = archivosQueImportan(
      (i) => i.startsWith(CARPETA_KEYCLOAK) || i.startsWith(CARPETA_PDP),
      [`${REGISTRO}.ts`],
    );

    expect(infractores).toEqual([]);
  });

  it('D-4: las implementaciones no importan stores, hooks, sesión ni features, ni se importan entre sí', () => {
    const prohibido = (propia: string, ajena: string) => (i: string) =>
      /^auth\/(authStore|roleStore|proveedorStore|session)$/.test(i) ||
      i.startsWith('hooks/') ||
      i.startsWith('features/') ||
      i.startsWith(ajena) ||
      (i === ADAPTADOR_KEYCLOAK && propia === CARPETA_PDP);

    const infractores = produccion
      .filter(({ ruta }) => ruta.startsWith(CARPETA_KEYCLOAK) || ruta.startsWith(CARPETA_PDP))
      .filter((fuente) => {
        const propia = fuente.ruta.startsWith(CARPETA_KEYCLOAK) ? CARPETA_KEYCLOAK : CARPETA_PDP;
        const ajena = propia === CARPETA_KEYCLOAK ? CARPETA_PDP : CARPETA_KEYCLOAK;
        return importsDe(fuente).some(prohibido(propia, ajena));
      })
      .map(({ ruta }) => ruta);

    expect(infractores).toEqual([]);
  });

  it('D-5: un único punto de composición, importado solo por la sesión y los hooks de auth', () => {
    const importadoresDelRegistro = archivosQueImportan(
      (i) => i === REGISTRO,
      ['auth/session.ts', 'hooks/useAuth.ts'],
    );
    const importadoresDeImplementaciones = archivosQueImportan(
      (i) => /\/(keycloakProveedor|pdpProveedor)$/.test(i),
      [`${REGISTRO}.ts`],
    );

    expect([...importadoresDelRegistro, ...importadoresDeImplementaciones]).toEqual([]);
  });

  it('D-6: ningún consumidor compara contra un proveedor concreto', () => {
    const infractores = archivosQueContienen(
      /(?:===|!==)\s*'(?:keycloak|pdp)'|case\s+'(?:keycloak|pdp)'/,
      [`${REGISTRO}.ts`],
    );

    expect(infractores).toEqual([]);
  });

  it('D-8: sin URLs, hosts ni orígenes escritos en el código de autenticación', () => {
    const alcance =
      /^(auth\/|api\/|guards\/|layout\/|hooks\/useAuth|features\/(seguridad|iniciar-sesion)\/|router\.tsx)/;
    const infractores = produccion
      .filter(({ ruta }) => alcance.test(ruta))
      .filter(({ contenido }) => /https?:\/\/|localhost/.test(quitarComentarios(contenido)))
      .map(({ ruta }) => ruta);

    expect(infractores).toEqual([]);
  });

  it('D-9: el contrato y el store de sesión no dependen de keycloak-js', () => {
    const infractores = produccion
      .filter(({ ruta }) => ['auth/authStore.ts', 'auth/proveedores/proveedor.ts'].includes(ruta))
      .filter((fuente) => importsDe(fuente).includes('keycloak-js'))
      .map(({ ruta }) => ruta);

    expect(infractores).toEqual([]);
  });
});
