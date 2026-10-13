import { describe, it, expect } from 'vitest';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import { marcarAsesorActual, puedeFinalizarse, ultimoRegistroSinAsesor } from './asesor-actual';

const asignado = { id: 'ASIGNADO', nombre: 'Asignado' };
const finalizado = { id: 'FINALIZADO', nombre: 'Finalizado' };

const base: AsesorProyectoGrado = {
  id: 'ap-4',
  proyectoGradoId: 'p-1',
  asesorId: 'a-1',
  identificador: '1001',
  nombre: 'Julian Alzate',
  email: 'julian@uco.edu.co',
  estado: asignado,
  fechaAsignado: '2026-04-01T12:00:00Z',
  vigente: true,
  actual: true,
};

const capturaDelDetalle: AsesorProyectoGrado[] = [
  base,
  { ...base, id: 'ap-3', estado: finalizado, actual: false },
  { ...base, id: 'ap-2', actual: false },
  {
    ...base,
    id: 'ap-1',
    asesorId: 'a-2',
    nombre: 'asesor asesor',
    estado: finalizado,
    actual: true,
  },
];

describe('marcarAsesorActual', () => {
  it('con el caso de la captura deja «actual» solo en la primera fila y conserva el orden', () => {
    // Act
    const resultado = marcarAsesorActual(capturaDelDetalle);

    // Assert
    expect(resultado.map((a) => a.id)).toEqual(['ap-4', 'ap-3', 'ap-2', 'ap-1']);
    expect(resultado.map((a) => a.actual)).toEqual([true, false, false, false]);
  });

  it('nunca marca una fila FINALIZADO ni deja actual si no hay ASIGNADO con actual', () => {
    // Arrange
    const finalizados = [
      { ...base, id: 'f-2', estado: finalizado, actual: true },
      { ...base, id: 'f-1', estado: finalizado, actual: false },
    ];
    const asignadoAntiguo = [{ ...base, id: 'x-1', actual: false }];

    // Act
    const resultadoFinalizados = marcarAsesorActual(finalizados);
    const resultadoAntiguo = marcarAsesorActual(asignadoAntiguo);

    // Assert
    expect(resultadoFinalizados.every((a) => !a.actual)).toBe(true);
    expect(resultadoAntiguo.every((a) => !a.actual)).toBe(true);
  });

  it('con dos ASIGNADO actual (dato anómalo) marca solo la primera', () => {
    // Arrange
    const anomalo = [base, { ...base, id: 'ap-0', asesorId: 'a-2' }];

    // Act
    const resultado = marcarAsesorActual(anomalo);

    // Assert
    expect(resultado.map((a) => a.actual)).toEqual([true, false]);
  });

  it('devuelve [] con lista vacía y no muta la entrada', () => {
    // Arrange
    const entrada = capturaDelDetalle.map((a) => Object.freeze({ ...a }));
    Object.freeze(entrada);

    // Act
    const resultado = marcarAsesorActual(entrada);

    // Assert
    expect(marcarAsesorActual([])).toEqual([]);
    expect(resultado).not.toBe(entrada);
    expect(entrada.map((a) => a.actual)).toEqual([true, false, false, true]);
  });
});

describe('ultimoRegistroSinAsesor', () => {
  it('devuelve la primera fila sin asesor asignado vigente y null en otro caso', () => {
    // Arrange
    const captura = [
      { ...base, id: 'ap-3', estado: finalizado, actual: true },
      { ...base, id: 'ap-2', actual: false },
      { ...base, id: 'ap-1', estado: finalizado, actual: false },
    ];

    // Assert
    expect(ultimoRegistroSinAsesor(marcarAsesorActual(captura))?.id).toBe('ap-3');
    expect(ultimoRegistroSinAsesor(marcarAsesorActual(capturaDelDetalle))).toBeNull();
    expect(ultimoRegistroSinAsesor([])).toBeNull();
  });
});

describe('puedeFinalizarse', () => {
  it('es true solo con ASIGNADO y actual, sin mirar vigente', () => {
    // Assert
    expect(puedeFinalizarse(base)).toBe(true);
    expect(puedeFinalizarse({ ...base, vigente: false })).toBe(true);
    expect(puedeFinalizarse({ ...base, estado: finalizado })).toBe(false);
    expect(puedeFinalizarse({ ...base, actual: false })).toBe(false);
  });
});
