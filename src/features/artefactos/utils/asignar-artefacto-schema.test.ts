import { describe, it, expect } from 'vitest';
import { MENSAJES_VALIDACION } from '../../../shared/validation';
import { asignarArtefactoSchema, campoDeCodigoAsignarArtefacto } from './asignar-artefacto-schema';

const UUID_A = '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b';
const UUID_B = '4a2d3b5f-6c7e-4f80-9bac-1d2e3f4a5b6c';

function mensajes(valores: unknown) {
  const resultado = asignarArtefactoSchema.safeParse(valores);
  return resultado.success ? [] : resultado.error.issues.map((i) => i.message);
}

describe('asignarArtefactoSchema', () => {
  it('acepta datos válidos y rechaza vacíos, UUID mal formado, lista vacía y repetidos', () => {
    // Arrange
    const valido = {
      proyectoGrado: UUID_A,
      versionRepositorioArtefacto: UUID_B,
      estudiantes: [UUID_A],
    };

    // Act
    const vacio = mensajes({ ...valido, proyectoGrado: '', versionRepositorioArtefacto: '' });
    const sinUuid = mensajes({ ...valido, proyectoGrado: 'no-es-uuid' });
    const sinEstudiantes = mensajes({ ...valido, estudiantes: [] });
    const repetidos = mensajes({ ...valido, estudiantes: [UUID_A, UUID_A] });

    // Assert
    expect(asignarArtefactoSchema.safeParse(valido).success).toBe(true);
    expect(vacio).toEqual([
      MENSAJES_VALIDACION.seleccioneOpcion,
      MENSAJES_VALIDACION.seleccioneOpcion,
    ]);
    expect(sinUuid).toHaveLength(1);
    expect(sinUuid[0]).not.toBe(MENSAJES_VALIDACION.seleccioneOpcion);
    expect(sinEstudiantes).toEqual([MENSAJES_VALIDACION.listaVacia]);
    expect(repetidos).toHaveLength(1);
    expect(repetidos[0]).not.toBe(MENSAJES_VALIDACION.listaVacia);
  });
});

describe('campoDeCodigoAsignarArtefacto', () => {
  it('atribuye cada código de negocio a su campo y deja sin campo los desconocidos', () => {
    // Act / Assert
    expect(campoDeCodigoAsignarArtefacto('ARTEFACTOS_ASESOR_PROYECTO_GRADO_NO_ASIGNADO')).toBe(
      'proyectoGrado',
    );
    expect(campoDeCodigoAsignarArtefacto('ARTEFACTOS_ARTEFACTO_REPOSITORIO_YA_ASIGNADO')).toBe(
      'versionRepositorioArtefacto',
    );
    expect(campoDeCodigoAsignarArtefacto('ARTEFACTOS_ESTUDIANTE_NO_VIGENTE')).toBe('estudiantes');
    expect(campoDeCodigoAsignarArtefacto('ARTEFACTOS_ASESOR_NO_ENCONTRADO')).toBeUndefined();
  });
});
