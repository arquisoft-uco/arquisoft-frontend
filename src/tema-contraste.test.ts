import { describe, expect, it } from 'vitest';
import cssTema from './tailwind.css?raw';
import cssUco from './uco-tokens.css?raw';
import {
  ratio,
  tokensDeTema,
  tonoYSaturacion,
  valoresCrudosDeTema,
  valoresUco,
} from './test-utils/contraste';

const todas = import.meta.glob<string>(
  '/src/{*,*/*,*/*/*,*/*/*/*,*/*/*/*/*,*/*/*/*/*/*}.{ts,tsx,css}',
  { query: '?raw', import: 'default', eager: true },
);

const EXENTOS = ['.d.ts', '.test.', '/test-utils/', '/src/tailwind.css', '/src/uco-tokens.css'];
const fuentes = Object.entries(todas).filter(([ruta]) => !EXENTOS.some((e) => ruta.includes(e)));

const tokens = tokensDeTema(cssTema, cssUco);
const uco = valoresUco(cssUco);

const TEXTO_NORMAL = 4.5;
const NO_TEXTO = 3;

type Par = [string, string];

function color(nombre: string): string {
  const hex = tokens.get(nombre);
  if (!hex) throw new Error(`Token --color-${nombre} no declarado`);
  return hex;
}

function incumplen(pares: Par[], minimo: number): string[] {
  return pares
    .map(([a, b]) => ({ par: `${a} sobre ${b}`, valor: ratio(color(a), color(b)) }))
    .filter(({ valor }) => valor < minimo)
    .map(({ par, valor }) => `${par}: ${valor.toFixed(2)} (mínimo ${minimo})`);
}

const SUPERFICIES = ['surface', 'surface-secondary', 'background'];
const FONDOS_DE_TEXTO = [
  ...SUPERFICIES,
  'muted',
  'primary-muted',
  'tertiary-muted',
  'nav-hover-bg',
  'nav-active-bg',
];

const PARES_DE_TEXTO: Par[] = [
  ['primary-foreground', 'primary'],
  ['primary-foreground', 'primary-hover'],
  ['secondary-foreground', 'secondary'],
  ['tertiary-foreground', 'tertiary'],
  ['danger-foreground', 'danger'],
  ['info-foreground', 'info'],
  ['primary-muted-foreground', 'primary-muted'],
  ['secondary-muted-foreground', 'secondary-muted'],
  ['tertiary-muted-foreground', 'tertiary-muted'],
  ['danger-muted-foreground', 'danger-muted'],
  ...SUPERFICIES.flatMap((s): Par[] => [
    ['primary', s],
    ['danger-strong', s],
  ]),
  ['tertiary-muted-foreground', 'surface'],
  ['danger-muted-foreground', 'surface'],
  ...['on-surface', 'on-surface-secondary'].flatMap((t): Par[] =>
    FONDOS_DE_TEXTO.map((f): Par => [t, f]),
  ),
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'surface'],
  ['nav-active-text', 'nav-active-bg'],
  ['primary', 'primary-muted'],
];

describe('tema de la UCO', () => {
  it('copia fiel del manual y fórmula WCAG que reproduce sus cifras publicadas', () => {
    // Arrange
    const esperados: Record<string, string> = {
      '--uco-verde': '#008b50',
      '--uco-amarillo': '#ffca00',
      '--uco-azul': '#1d3475',
      '--uco-verde-oscuro': '#024426',
      '--uco-turquesa': '#04b5ac',
      '--uco-naranja': '#e28210',
    };
    const publicadas: Array<[string, string, number]> = [
      ['#ffffff', '#024426', 11.31],
      ['#ffffff', '#008b50', 4.37],
      ['#000000', '#008b50', 4.81],
      ['#000000', '#ffca00', 13.7],
      ['#ffffff', '#1d3475', 11.66],
      ['#000000', '#e28210', 7.43],
      ['#ffffff', '#e28210', 2.82],
    ];

    // Act
    const valores = Object.fromEntries(Object.keys(esperados).map((k) => [k, uco.get(k)]));
    const desviadas = publicadas.filter(([a, b, cifra]) => Math.abs(ratio(a, b) - cifra) > 0.01);

    // Assert
    expect(valores).toEqual(esperados);
    expect(desviadas).toEqual([]);
  });

  it('todo par de texto cumple 4,5:1', () => {
    expect(incumplen(PARES_DE_TEXTO, TEXTO_NORMAL)).toEqual([]);
  });

  it('borde de control, foco y bordes activos cumplen 3:1', () => {
    // Arrange
    const pares: Par[] = [
      ...['surface', 'background', 'muted'].map((f): Par => ['border-input', f]),
      ...[...SUPERFICIES, 'muted', 'primary-muted', 'nav-active-bg'].map((f): Par => ['focus', f]),
      ['primary', 'surface'],
    ];

    // Assert
    expect(incumplen(pares, NO_TEXTO)).toEqual([]);
  });

  it('no hay rojo, el peligro es el naranja y el amarillo no es color de texto', () => {
    // Arrange
    const rojizos = [...tokens]
      .filter(([, hex]) => {
        const { tono, saturacion } = tonoYSaturacion(hex);
        return (tono >= 345 || tono <= 15) && saturacion > 40;
      })
      .map(([nombre]) => nombre);

    // Assert
    expect(color('danger')).toBe('#e28210');
    expect(rojizos).toEqual([]);
    expect(incumplen([['tertiary', 'surface']], TEXTO_NORMAL)).toHaveLength(1);
  });

  it('todo token de color es hex de 6 dígitos o referencia que resuelve a uno', () => {
    // Arrange
    const valido = /^(?:#[0-9a-f]{6}|var\(--uco-[\w-]+\))$/i;
    const invalidos = [...valoresCrudosDeTema(cssTema)]
      .filter(([, valor]) => !valido.test(valor))
      .map(([nombre]) => nombre);
    const sinResolver = [...tokens].filter(([, hex]) => !/^#[0-9a-f]{6}$/i.test(hex));

    // Assert
    expect(invalidos).toEqual([]);
    expect(sinResolver).toEqual([]);
  });

  it('ningún archivo de producción escribe colores literales fuera del tema', () => {
    // Arrange
    const literal = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b|\b(?:rgba?|hsla?|oklch)\(/i;

    // Act
    const infractores = fuentes
      .filter(([, contenido]) => literal.test(contenido))
      .map(([ruta]) => ruta);

    // Assert
    expect(
      infractores,
      'Usa un token de src/tailwind.css (bg-primary, text-danger-strong…); no escribas el color',
    ).toEqual([]);
  });
});
