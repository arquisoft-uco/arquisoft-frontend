export type Medicion = Record<string, number>;

interface Fuente {
  ruta: string;
  contenido: string;
}

interface Dependencia {
  origen: string;
  destino: string | null;
  especificador: string;
  dinamica: boolean;
}

type Capa = 'models' | 'services' | 'utils' | 'hooks' | 'components' | 'pagina';

const fuentes = import.meta.glob<string>(
  [
    '/src/**/*.{ts,tsx}',
    '!/src/**/*.d.ts',
    '!/src/arquitectura.test.ts',
    '!/src/test-utils/arquitectura*.ts',
  ],
  { query: '?raw', import: 'default', eager: true },
);

const hojaDeEstilos = import.meta.glob<string>('/src/tailwind.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const configProhibidaEnRaiz = import.meta.glob('/{tailwind,postcss,vitest}.config.*');

const RAIZ_SRC = '/src/';
const CAPAS_DE_FEATURE: readonly string[] = ['models', 'services', 'hooks', 'components', 'utils'];
const RANGO_DE_CAPA: Record<Capa, number> = {
  models: 0,
  services: 1,
  utils: 1,
  hooks: 2,
  components: 3,
  pagina: 4,
};
const UMBRAL_LINEAS_COMPONENTE = 150;
const ARCHIVOS_CON_AXIOS = ['api/axiosInstance.ts', 'shared/utils/api-error.ts'];
const ARCHIVO_CON_STORAGE = 'auth/roleStore.ts';
const MODELO_CON_RUNTIME_PERMITIDO = 'shared/models/rol.ts';
const COLORES_DE_PALETA =
  'red|blue|green|yellow|gray|slate|zinc|amber|orange|emerald|indigo|sky|purple|pink|rose|neutral|stone|lime|teal|cyan|violet|fuchsia';
const PREFIJOS_DE_COLOR =
  'bg|text|border|ring|from|to|via|fill|stroke|divide|outline|decoration|accent|caret|placeholder';
const NOMBRES_DE_COLOR_SHADCN = 'muted|accent|card|popover|input|destructive|success|warning|info';

const PATRON_IMPORT =
  /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
const PATRON_QUERY_KEY = /(?:queryKey:\s*|\b\w*KEY\w*\s*=\s*)\[\s*'([^']+)'/g;
const PATRON_TIPO_INSEGURO =
  /\bas unknown as\b|:\s*any\b|<any>|\bas any\b|@ts-ignore|@ts-expect-error/g;
const PATRON_COLOR_CRUDO = new RegExp(
  `\\b(?:${PREFIJOS_DE_COLOR})-(?:${COLORES_DE_PALETA})-\\d{2,3}\\b`,
  'g',
);
// Lookbehind: border-border-input no es border-input. Lookahead: bg-card-elevated no es bg-card.
const PATRON_COLOR_SIN_TOKEN = new RegExp(
  `(?<![\\w-])(?:${PREFIJOS_DE_COLOR})-((?:${NOMBRES_DE_COLOR_SHADCN})(?:-foreground)?|foreground)(?![\\w-])`,
  'g',
);
const PATRON_TOKEN_DE_COLOR = /--color-([\w-]+)\s*:/g;
const PATRON_JSDOC = /\/\*\*/g;
const PATRON_CONSOLE_LOG = /\bconsole\.log\s*\(/;
const PATRON_STORAGE = /\b(?:localStorage|sessionStorage)\b/;
const PATRON_RUNTIME_EN_MODELO =
  /^\s*export\s+(?:const|let|var|function|class|enum|abstract|default)\b/m;

const TOKENS_DE_COLOR = extraerTokensDeColor(Object.values(hojaDeEstilos).join('\n'));

const esTest = (ruta: string) => /\.test\.tsx?$/.test(ruta);
const esSoporteDeTest = (ruta: string) => ruta.startsWith('test-utils/');

const todas: Fuente[] = Object.entries(fuentes).map(([ruta, contenido]) => ({
  ruta: ruta.slice(RAIZ_SRC.length),
  contenido,
}));
const produccion = todas.filter((f) => !esTest(f.ruta) && !esSoporteDeTest(f.ruta));
const rutasDeProduccion = new Set(produccion.map((f) => f.ruta));

function ubicarEnFeature(ruta: string): { feature: string; capa: Capa } | null {
  const [raiz, feature, tercero] = ruta.split('/');
  if (raiz !== 'features' || !feature) return null;
  const capa = CAPAS_DE_FEATURE.includes(tercero) ? (tercero as Capa) : 'pagina';
  return { feature, capa };
}

function zonaDe(ruta: string): string {
  const feature = ubicarEnFeature(ruta);
  if (feature) return `features/${feature.feature}`;
  return ruta.includes('/') ? ruta.split('/')[0] : 'raiz';
}

function resolverImport(desde: string, especificador: string): string | null {
  if (!especificador.startsWith('.')) return null;
  const partes = desde.split('/').slice(0, -1);
  for (const segmento of especificador.split('/')) {
    if (segmento === '..') partes.pop();
    else if (segmento !== '.') partes.push(segmento);
  }
  const base = partes.join('/');
  const candidatos = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
  return candidatos.find((c) => rutasDeProduccion.has(c)) ?? null;
}

const dependencias: Dependencia[] = produccion.flatMap(({ ruta, contenido }) =>
  [...contenido.matchAll(PATRON_IMPORT)].map((m) => {
    const especificador = m[1] ?? m[2] ?? m[3];
    return {
      origen: ruta,
      destino: resolverImport(ruta, especificador),
      especificador,
      dinamica: m[3] !== undefined,
    };
  }),
);

const dentroDe = (ruta: string, carpeta: string) =>
  ruta.startsWith(`${carpeta}/`) || ruta.includes(`/${carpeta}/`);
const contar = (contenido: string, patron: RegExp) => [...contenido.matchAll(patron)].length;
const lineasDe = (contenido: string) => contenido.replace(/\n$/, '').split('\n').length;

function medirPorArchivo(archivos: Fuente[], medir: (f: Fuente) => number): Medicion {
  const medido: Medicion = {};
  for (const archivo of archivos) {
    const valor = medir(archivo);
    if (valor > 0) medido[archivo.ruta] = valor;
  }
  return medido;
}

export function violacionesDeCapas(): string[] {
  return dependencias.flatMap(({ origen, destino }) => {
    const desde = ubicarEnFeature(origen);
    const hacia = destino ? ubicarEnFeature(destino) : null;
    if (!desde || !hacia || desde.feature !== hacia.feature) return [];
    return RANGO_DE_CAPA[hacia.capa] > RANGO_DE_CAPA[desde.capa]
      ? [`${origen} (${desde.capa}) importa ${destino} (${hacia.capa})`]
      : [];
  });
}

export function violacionesEntreFeatures(): string[] {
  return dependencias.flatMap(({ origen, destino }) => {
    const desde = ubicarEnFeature(origen);
    const hacia = destino ? ubicarEnFeature(destino) : null;
    return desde && hacia && desde.feature !== hacia.feature
      ? [`${origen} importa ${destino}`]
      : [];
  });
}

export function violacionesDeInfraestructura(): string[] {
  const infraestructura = ['shared', 'api', 'auth', 'config'];
  return dependencias.flatMap(({ origen, destino }) =>
    infraestructura.includes(zonaDe(origen)) && destino && ubicarEnFeature(destino)
      ? [`${origen} importa ${destino}`]
      : [],
  );
}

export function violacionesDeHttp(): string[] {
  const clienteHttp = dependencias
    .filter(({ destino }) => destino === 'api/axiosInstance.ts')
    .filter(({ origen }) => !dentroDe(origen, 'services') && !origen.startsWith('auth/'))
    .map(({ origen }) => `${origen} importa el cliente HTTP (api/axiosInstance.ts)`);
  const axiosDirecto = dependencias
    .filter(({ especificador }) => especificador === 'axios')
    .filter(({ origen }) => !ARCHIVOS_CON_AXIOS.includes(origen))
    .map(({ origen }) => `${origen} importa 'axios' directamente`);
  return [...clienteHttp, ...axiosDirecto];
}

export function violacionesDeServices(): string[] {
  const dependenciasProhibidas = ['react', 'react-dom', '@tanstack/react-query'];
  return dependencias
    .filter(({ origen }) => dentroDe(origen, 'services'))
    .flatMap(({ origen, destino, especificador }) => {
      if (dependenciasProhibidas.includes(especificador))
        return [`${origen} importa '${especificador}'`];
      if (destino && (/Store\.ts$/.test(destino) || dentroDe(destino, 'stores'))) {
        return [`${origen} importa el store ${destino}`];
      }
      if (destino && (dentroDe(destino, 'hooks') || dentroDe(destino, 'components'))) {
        return [`${origen} importa ${destino}`];
      }
      return [];
    });
}

export function violacionesDeHooks(): string[] {
  return dependencias
    .filter(({ origen }) => dentroDe(origen, 'hooks'))
    .flatMap(({ origen, destino, especificador }) => {
      if (especificador === 'lucide-react') return [`${origen} importa 'lucide-react'`];
      if (destino && dentroDe(destino, 'components'))
        return [`${origen} importa el componente ${destino}`];
      return [];
    });
}

export function violacionesDeModelos(): string[] {
  return produccion
    .filter(({ ruta }) => dentroDe(ruta, 'models') && ruta !== MODELO_CON_RUNTIME_PERMITIDO)
    .filter(({ contenido }) => PATRON_RUNTIME_EN_MODELO.test(contenido))
    .map(({ ruta }) => `${ruta} exporta código de runtime`);
}

export function ciclosEstaticos(): string[] {
  const grafo = new Map<string, string[]>();
  for (const { origen, destino, dinamica } of dependencias) {
    if (dinamica || !destino) continue;
    grafo.set(origen, [...(grafo.get(origen) ?? []), destino]);
  }
  const ciclos: string[] = [];
  const estado = new Map<string, 'visitando' | 'listo'>();
  const camino: string[] = [];
  const visitar = (nodo: string) => {
    estado.set(nodo, 'visitando');
    camino.push(nodo);
    for (const vecino of grafo.get(nodo) ?? []) {
      if (estado.get(vecino) === 'visitando') {
        ciclos.push([...camino.slice(camino.indexOf(vecino)), vecino].join(' -> '));
      } else if (!estado.has(vecino)) {
        visitar(vecino);
      }
    }
    camino.pop();
    estado.set(nodo, 'listo');
  };
  for (const nodo of grafo.keys()) if (!estado.has(nodo)) visitar(nodo);
  return ciclos;
}

export function queryKeysFueraDeConvencion(): Medicion {
  return medirPorArchivo(
    produccion.filter(({ ruta }) => ubicarEnFeature(ruta)),
    ({ ruta, contenido }) => {
      const feature = ubicarEnFeature(ruta)?.feature;
      return [...contenido.matchAll(PATRON_QUERY_KEY)].filter((m) => m[1] !== feature).length;
    },
  );
}

export function tiposInseguros(): Medicion {
  return medirPorArchivo(todas, ({ contenido }) => contar(contenido, PATRON_TIPO_INSEGURO));
}

export function consolesLog(): string[] {
  return produccion
    .filter(({ contenido }) => PATRON_CONSOLE_LOG.test(contenido))
    .map(({ ruta }) => ruta);
}

export function usosDeStorage(): string[] {
  return produccion
    .filter(({ ruta }) => ruta !== ARCHIVO_CON_STORAGE)
    .filter(({ contenido }) => PATRON_STORAGE.test(contenido))
    .map(({ ruta }) => ruta);
}

export function componentesGrandes(): Medicion {
  const medido = medirPorArchivo(
    produccion.filter(({ ruta }) => ruta.endsWith('.tsx')),
    ({ contenido }) => lineasDe(contenido),
  );
  return Object.fromEntries(
    Object.entries(medido).filter(([, lineas]) => lineas > UMBRAL_LINEAS_COMPONENTE),
  );
}

export function coloresCrudos(): Medicion {
  return medirPorArchivo(produccion, ({ contenido }) => contar(contenido, PATRON_COLOR_CRUDO));
}

export function extraerTokensDeColor(css: string): ReadonlySet<string> {
  return new Set([...css.matchAll(PATRON_TOKEN_DE_COLOR)].map((m) => m[1]));
}

export function contarColoresSinToken(
  contenido: string,
  tokensDeclarados: ReadonlySet<string>,
): number {
  const sinToken = [...contenido.matchAll(PATRON_COLOR_SIN_TOKEN)].filter(
    (m) => !tokensDeclarados.has(m[1]),
  );
  return sinToken.length;
}

export function tokensDeColorDeclarados(): ReadonlySet<string> {
  return TOKENS_DE_COLOR;
}

export function coloresSinToken(): Medicion {
  return medirPorArchivo(produccion, ({ contenido }) =>
    contarColoresSinToken(contenido, TOKENS_DE_COLOR),
  );
}

export function bloquesJsdoc(): Medicion {
  return medirPorArchivo(todas, ({ contenido }) => contar(contenido, PATRON_JSDOC));
}

export function configuracionProhibida(): string[] {
  return Object.keys(configProhibidaEnRaiz);
}

export function compararConBaseline(medido: Medicion, baseline: Medicion): string[] {
  const problemas: string[] = [];
  for (const [archivo, valor] of Object.entries(medido)) {
    const tope = baseline[archivo];
    if (tope === undefined) problemas.push(`${archivo}: desviación nueva (${valor})`);
    else if (valor > tope) problemas.push(`${archivo}: crece de ${tope} a ${valor}`);
  }
  for (const archivo of Object.keys(baseline)) {
    if (!(archivo in medido))
      problemas.push(`${archivo}: ya cumple; elimínalo de arquitectura.baseline.ts`);
  }
  return problemas;
}
