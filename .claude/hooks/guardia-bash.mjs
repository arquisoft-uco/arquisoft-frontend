import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const RAMAS_PROTEGIDAS = ['main', 'master', 'develop'];
const REPOSITORIOS_DIRECTO_A_MAIN = ['arquisoft-docs'];
const ARCHIVO_NO_VERSIONABLE = /(^|\/)(\.env(\.[\w.-]+)?|dist|node_modules|\.workspace)(\/.*)?$/;
const ES_PLANTILLA_DE_ENTORNO = /\.env\.example$/;
const ES_BANDERA_FORZAR = /^(--force(-[\w-]+)?|-[a-zA-Z]*f[a-zA-Z]*)$/;
const ES_BANDERA_BORRAR = /^(--delete|-[a-zA-Z]*d[a-zA-Z]*)$/;

const INICIO_DE_ORDEN = String.raw`(?:^\s*(?:\w+=\S+\s+)*|\b(?:ba|z|da)?sh\s+-\w*c\s+["'])`;
const PATRON_GH_MERGE = new RegExp(`${INICIO_DE_ORDEN}gh\\s+pr\\s+merge\\b`);
const PATRON_GH_REVIEW = new RegExp(`${INICIO_DE_ORDEN}gh\\s+pr\\s+review\\b`);
const PATRON_GH_API_MERGE = new RegExp(
  `${INICIO_DE_ORDEN}gh\\s+api\\b.*\\/pulls\\/[^\\s/]+\\/merge\\b`,
);
const PATRON_GH_API = new RegExp(`${INICIO_DE_ORDEN}gh\\s+api\\b`);
const PATRON_API_DE_REVISION = /\/pulls\/[^\s/]+\/reviews\b/;
const PATRON_API_ESCRIBE =
  /(?:\s-[a-zA-Z]*[fF]\b|--(?:raw-)?field\b|--input\b|-X\s*(?:POST|PUT)\b|--method[\s=]+(?:POST|PUT)\b)/i;
const PATRON_MUTACION_DE_PR =
  /\b(?:mergePullRequest|approvePullRequest|addPullRequestReview|submitPullRequestReview|enablePullRequestAutoMerge)\b/;
const PATRON_GIT = new RegExp(
  `${INICIO_DE_ORDEN}git((?:\\s+(?:-C\\s+\\S+|-c\\s+\\S+|--[\\w-]+(?:=\\S+)?))*)\\s+(push|commit|add)\\b(.*)$`,
);
const PATRON_CAMBIO_DE_DIRECTORIO =
  /^\s*(?:&\s*)?(?:cd|pushd|Set-Location)\s+("[^"]*"|'[^']*'|\S+)\s*$/i;
const ES_RUTA_ABSOLUTA = /^(?:[a-zA-Z]:[\\/]|[\\/]|~)/;
const ES_RUTA_MSYS = /^\/([a-zA-Z])(?=\/|$)/;
const NOMBRE_DEL_REMOTO = /([^/:\\]+?)(?:\.git)?\/?$/;

const sinComillas = (texto) => texto.replace(/^["']+|["')]+$/g, '');
const rechazar = (razon) => ({ decision: 'deny', razon });

function resolverDirectorio(base, destino) {
  if (!destino) return base;
  if (!base || ES_RUTA_ABSOLUTA.test(destino)) return destino;
  return `${base.replace(/[\\/]+$/, '')}/${destino}`;
}

function quitarHeredocs(comando) {
  return comando.replace(/<<-?\s*["']?(\w+)["']?[^\n]*\n[\s\S]*?\n\s*\1(?=\s|\)|$)/g, '');
}

function evaluarPush(tokens, contexto) {
  const banderas = tokens.filter((t) => t.startsWith('-'));
  const refspecs = tokens.filter((t) => !t.startsWith('-')).slice(1);

  if (banderas.some((t) => ES_BANDERA_FORZAR.test(t))) {
    return rechazar(
      'git push con --force está prohibido. Si el push fue rechazado, integra los cambios remotos (git pull --rebase) y vuelve a subir sin forzar.',
    );
  }
  if (banderas.some((t) => ES_BANDERA_BORRAR.test(t)) || refspecs.some((r) => r.startsWith(':'))) {
    return rechazar(
      'Borrar ramas remotas no se hace desde el agente: pídele al usuario que lo haga.',
    );
  }
  if (refspecs.some((r) => r.startsWith('+'))) {
    return rechazar('Un refspec con "+" fuerza el push y está prohibido. Sube sin forzar.');
  }

  if (contexto.directoAMain()) return null;

  const destinos = refspecs.map((r) =>
    r
      .split(':')
      .pop()
      .replace(/^refs\/heads\//, ''),
  );
  if (destinos.some((d) => RAMAS_PROTEGIDAS.includes(d))) {
    return rechazar(
      `No se hace push a ${RAMAS_PROTEGIDAS.join(', ')}. Sube una rama de trabajo y abre un PR hacia develop.`,
    );
  }

  const empujaLaRamaActual = refspecs.length === 0 || refspecs.every((r) => r === 'HEAD');
  const rama = empujaLaRamaActual ? contexto.rama() : null;
  if (rama && RAMAS_PROTEGIDAS.includes(rama)) {
    return rechazar(
      `Estás en ${rama}: no se sube desde una rama protegida. Crea una rama de trabajo (feature/, fix/…) y abre un PR hacia develop.`,
    );
  }
  return null;
}

function evaluarCommit(contexto) {
  if (contexto.directoAMain()) return null;
  const rama = contexto.rama();
  if (rama && RAMAS_PROTEGIDAS.includes(rama)) {
    return rechazar(
      `No se commitea sobre ${rama}. Crea una rama de trabajo (feature/, fix/…) y commitea allí.`,
    );
  }
  return null;
}

function evaluarAdd(tokens) {
  if (tokens.some((t) => ES_BANDERA_FORZAR.test(t))) {
    return rechazar('git add --force está prohibido: lo ignorado por .gitignore no se versiona.');
  }
  const prohibido = tokens.find(
    (t) => !t.startsWith('-') && !ES_PLANTILLA_DE_ENTORNO.test(t) && ARCHIVO_NO_VERSIONABLE.test(t),
  );
  if (prohibido) {
    return rechazar(
      `${prohibido} no se versiona (.env*, dist/, node_modules/ y .workspace/ están fuera del repo). Solo .env.example se commitea.`,
    );
  }
  return null;
}

function esApiQueRevisaOMergea(segmento) {
  if (!PATRON_GH_API.test(segmento)) return false;
  const escribeRevision =
    PATRON_API_DE_REVISION.test(segmento) && PATRON_API_ESCRIBE.test(segmento);
  return escribeRevision || PATRON_MUTACION_DE_PR.test(segmento);
}

function evaluarSegmento(segmento, ramaDe, repositorioDe, directorioActual) {
  if (PATRON_GH_MERGE.test(segmento) || PATRON_GH_API_MERGE.test(segmento)) {
    return rechazar(
      'El merge de un PR lo aprueba y ejecuta una persona desde GitHub después de revisarlo.',
    );
  }
  if (PATRON_GH_REVIEW.test(segmento) || esApiQueRevisaOMergea(segmento)) {
    return rechazar(
      'La revisión, la aprobación y el merge de un PR los hace una persona en GitHub, no el agente.',
    );
  }

  const git = PATRON_GIT.exec(segmento);
  if (!git) return null;

  const [, opciones, subcomando, argumentos] = git;
  const opcionC = /-C\s+(\S+)/.exec(opciones)?.[1];
  const directorio = resolverDirectorio(
    directorioActual,
    opcionC ? sinComillas(opcionC) : undefined,
  );
  const contexto = {
    rama: () => ramaDe(directorio),
    directoAMain: () => REPOSITORIOS_DIRECTO_A_MAIN.includes(repositorioDe(directorio)),
  };
  const tokens = argumentos.trim().split(/\s+/).filter(Boolean).map(sinComillas);

  if (subcomando === 'push') return evaluarPush(tokens, contexto);
  if (subcomando === 'commit') return evaluarCommit(contexto);
  return evaluarAdd(tokens);
}

export function evaluarComando(comando, ramaDe, repositorioDe = () => null) {
  const segmentos = quitarHeredocs(comando).split(/&&|\|\||;|\||\n/);
  let directorioActual;
  for (const segmento of segmentos) {
    const cambio = PATRON_CAMBIO_DE_DIRECTORIO.exec(segmento);
    if (cambio) {
      directorioActual = resolverDirectorio(directorioActual, sinComillas(cambio[1]));
      continue;
    }
    const veredicto = evaluarSegmento(segmento, ramaDe, repositorioDe, directorioActual);
    if (veredicto) return veredicto;
  }
  return null;
}

function paraGit(directorio) {
  if (process.platform !== 'win32') return directorio;
  return directorio.replace(ES_RUTA_MSYS, (_, unidad) => `${unidad.toUpperCase()}:`);
}

function consultarGit(directorio, cwd, argumentos) {
  if (directorio && /[$`~]/.test(directorio)) return null;
  try {
    return execFileSync(
      'git',
      [...(directorio ? ['-C', paraGit(directorio)] : []), ...argumentos],
      {
        cwd,
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim();
  } catch {
    return null;
  }
}

function ramaDelRepositorio(directorio, cwd) {
  return consultarGit(directorio, cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
}

function nombreDelRepositorio(directorio, cwd) {
  const remoto = consultarGit(directorio, cwd, ['config', '--get', 'remote.origin.url']);
  return remoto ? (NOMBRE_DEL_REMOTO.exec(remoto)?.[1] ?? null) : null;
}

function main() {
  let entrada;
  try {
    entrada = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return;
  }
  const comando = entrada?.tool_input?.command;
  if (typeof comando !== 'string') return;

  const veredicto = evaluarComando(
    comando,
    (directorio) => ramaDelRepositorio(directorio, entrada.cwd),
    (directorio) => nombreDelRepositorio(directorio, entrada.cwd),
  );
  if (!veredicto) return;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Bloqueado por .claude/hooks/guardia-bash.mjs: ${veredicto.razon}`,
      },
    }),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
