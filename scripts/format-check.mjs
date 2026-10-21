import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const EXTENSIONES_DE_CODIGO = /\.(ts|tsx|css)$/;
const BASES_CANDIDATAS = [process.env.FORMAT_BASE, 'origin/develop', 'develop', 'HEAD~1'];

const git = (...argumentos) => execFileSync('git', argumentos, { encoding: 'utf8' }).trim();
const lineas = (texto) => texto.split('\n').filter(Boolean);

function resolverBase() {
  for (const referencia of BASES_CANDIDATAS.filter(Boolean)) {
    try {
      return git('merge-base', 'HEAD', referencia);
    } catch {
      // la referencia no existe en este clon; se prueba la siguiente
    }
  }
  return null;
}

function archivosModificados(base) {
  const versionados = lineas(git('diff', '--name-only', '--diff-filter=ACMR', base, '--', 'src'));
  const nuevos = lineas(git('ls-files', '--others', '--exclude-standard', '--', 'src'));
  return [...new Set([...versionados, ...nuevos])].filter(
    (archivo) => EXTENSIONES_DE_CODIGO.test(archivo) && existsSync(archivo),
  );
}

const base = resolverBase();
if (!base) {
  console.warn('format:check: no se encontró una rama base (origin/develop). Define FORMAT_BASE.');
  process.exit(process.env.CI ? 1 : 0);
}

const archivos = archivosModificados(base);
if (archivos.length === 0) {
  console.log('format:check: sin archivos modificados en src/.');
  process.exit(0);
}

const resultado = spawnSync('npx', ['prettier', '--list-different', ...archivos], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
const sinFormato = lineas(resultado.stdout ?? '');
if (sinFormato.length === 0 && resultado.status === 0) {
  console.log(`format:check: ${archivos.length} archivo(s) modificado(s) con formato correcto.`);
  process.exit(0);
}

console.error(
  `format:check: sin el formato de Prettier:\n${sinFormato.map((a) => `  ${a}`).join('\n')}\n\n` +
    `Formatea solo lo que tocaste con:\n  npx prettier --write ${sinFormato.join(' ')}`,
);
process.exit(1);
