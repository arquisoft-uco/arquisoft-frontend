import type { AutorResumen } from '../models/biblioteca';

const INICIA_CON_SONIDO_I = /^h?i/;

function conjuncionAnte(nombre: string): 'y' | 'e' {
  const base = nombre.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return INICIA_CON_SONIDO_I.test(base) ? 'e' : 'y';
}

export function nombresDeAutores(autores: AutorResumen[]): string {
  const nombres = autores.map((autor) => autor.nombre);
  if (nombres.length <= 1) return nombres.join('');
  const ultimo = nombres[nombres.length - 1];
  return `${nombres.slice(0, -1).join(', ')} ${conjuncionAnte(ultimo)} ${ultimo}`;
}
