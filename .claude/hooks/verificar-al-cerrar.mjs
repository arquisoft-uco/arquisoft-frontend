import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const LINEAS_DE_ERROR = 40;
const VERIFICACIONES = [
  { nombre: 'npm run lint', comando: 'npm', argumentos: ['run', 'lint', '--silent'] },
  {
    nombre: 'test de arquitectura',
    comando: 'npx',
    argumentos: ['vitest', 'run', 'src/arquitectura.test.ts'],
  },
];

function leerEntrada() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function hayCambiosEnSrc(cwd) {
  try {
    const estado = execFileSync('git', ['status', '--porcelain', '--', 'src'], {
      cwd,
      encoding: 'utf8',
      timeout: 10000,
    });
    return estado.trim().length > 0;
  } catch {
    return false;
  }
}

function main() {
  const entrada = leerEntrada();
  if (entrada.stop_hook_active || process.env.SALTAR_VERIFICACION_AL_CERRAR) return;

  const cwd = entrada.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  if (!hayCambiosEnSrc(cwd)) return;

  for (const { nombre, comando, argumentos } of VERIFICACIONES) {
    const resultado = spawnSync(comando, argumentos, {
      cwd,
      encoding: 'utf8',
      timeout: 120000,
      shell: process.platform === 'win32',
    });
    if (resultado.status === 0) continue;

    const salida = `${resultado.stdout ?? ''}${resultado.stderr ?? ''}`.trim().split('\n');
    process.stderr.write(
      `${nombre} falló con cambios sin verificar en src/. Corrige antes de terminar:\n${salida.slice(-LINEAS_DE_ERROR).join('\n')}\n`,
    );
    process.exit(2);
  }
}

main();
