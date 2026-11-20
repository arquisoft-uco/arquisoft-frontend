export type Rgb = readonly [number, number, number];

const HEX_DE_SEIS = /^#[0-9a-f]{6}$/i;

export function hexARgb(hex: string): Rgb {
  if (!HEX_DE_SEIS.test(hex)) throw new Error(`Hex de 6 dígitos esperado, llegó «${hex}»`);
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function canalLineal(canal: number): number {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function luminancia(hex: string): number {
  const [r, g, b] = hexARgb(hex);
  return 0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b);
}

export function ratio(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function tonoYSaturacion(hex: string): { tono: number; saturacion: number } {
  const [r, g, b] = hexARgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return { tono: 0, saturacion: 0 };
  const luz = (max + min) / 2;
  const saturacion = (delta / (1 - Math.abs(2 * luz - 1))) * 100;
  let tono: number;
  if (max === r) tono = ((g - b) / delta) % 6;
  else if (max === g) tono = (b - r) / delta + 2;
  else tono = (r - g) / delta + 4;
  return { tono: (tono * 60 + 360) % 360, saturacion };
}

function declaraciones(css: string, prefijo: string): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const m of css.matchAll(new RegExp(`(${prefijo}[\\w-]*)\\s*:\\s*([^;]+);`, 'g'))) {
    mapa.set(m[1], m[2].trim());
  }
  return mapa;
}

export function valoresUco(cssUco: string): Map<string, string> {
  return declaraciones(cssUco, '--uco-');
}

export function valoresCrudosDeTema(cssTema: string): Map<string, string> {
  return declaraciones(cssTema, '--color-');
}

export function tokensDeTema(cssTema: string, cssUco: string): Map<string, string> {
  const uco = valoresUco(cssUco);
  const resueltos = new Map<string, string>();
  for (const [nombre, valor] of valoresCrudosDeTema(cssTema)) {
    const referencia = valor.match(/^var\((--uco-[\w-]+)\)$/);
    const hex = referencia ? (uco.get(referencia[1]) ?? '') : valor;
    resueltos.set(nombre.replace(/^--color-/, ''), hex);
  }
  return resueltos;
}
