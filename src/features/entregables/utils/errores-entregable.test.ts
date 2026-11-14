import { describe, it, expect } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import {
  mensajeErrorCambiarEstadoEntregable,
  mensajeErrorConsultaEntregable,
  mensajeErrorDescargarPaquete,
  mensajeErrorGenerarEntregable,
} from './errores-entregable';
import { MOTIVO_NO_CERRABLE } from './estados-entregable';

function errorApi(status: number, errorCode: string, message = 'Mensaje del backend') {
  const respuesta = { status, data: { errorCode, message } } as AxiosResponse;
  return new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, respuesta);
}

const P = 'ENTREGABLES_';
const EPG = `${P}ENTREGABLE_PROYECTO_GRADO_`;

describe('errores-entregable', () => {
  it('generar traduce cada código conocido y cae al mensaje del backend con uno desconocido', () => {
    // Assert
    expect(
      mensajeErrorGenerarEntregable(errorApi(422, `${P}ARTEFACTO_SIN_ARTEFACTOS_PARA_PAQUETE`)),
    ).toBe('No hay artefactos con revisión cerrada para empaquetar.');
    expect(
      mensajeErrorGenerarEntregable(errorApi(422, `${P}PAQUETE_ENTREGABLE_DESACTUALIZADO`)),
    ).toContain('cambiaron mientras se armaba el paquete');
    expect(mensajeErrorGenerarEntregable(errorApi(422, `${EPG}VIGENTE_YA_EXISTE`))).toContain(
      'ya tiene un entregable vigente',
    );
    expect(
      mensajeErrorGenerarEntregable(errorApi(422, `${P}ASESOR_PROYECTO_GRADO_NO_ASIGNADO`)),
    ).toBe('Ya no eres el asesor vigente de este proyecto.');
    expect(
      mensajeErrorGenerarEntregable(
        errorApi(503, `${P}PAQUETE_ENTREGABLE_ARCHIVO_ARTEFACTO_NO_DISPONIBLE`),
      ),
    ).toContain('no está disponible por ahora');
    expect(mensajeErrorGenerarEntregable(errorApi(422, 'OTRO_CODIGO'))).toBe('Mensaje del backend');
    expect(mensajeErrorGenerarEntregable(new Error('red'))).toBe('Inténtalo nuevamente.');
  });

  it('cambiar estado traduce cada código de transición', () => {
    // Assert
    expect(
      mensajeErrorCambiarEstadoEntregable(errorApi(422, `${P}ASESOR_PROYECTO_GRADO_NO_ASIGNADO`)),
    ).toBe('Ya no eres el asesor vigente de este proyecto.');
    expect(
      mensajeErrorCambiarEstadoEntregable(errorApi(422, `${EPG}CANCELACION_NO_PERMITIDA`)),
    ).toContain('no se puede cancelar');
    expect(mensajeErrorCambiarEstadoEntregable(errorApi(422, `${EPG}CIERRE_NO_PERMITIDO`))).toBe(
      MOTIVO_NO_CERRABLE,
    );
    expect(
      mensajeErrorCambiarEstadoEntregable(
        errorApi(422, `${EPG}DISPONIBILIDAD_EVALUACION_NO_PERMITIDA`),
      ),
    ).toContain('Solo un entregable Nuevo');
    expect(mensajeErrorCambiarEstadoEntregable(errorApi(422, `${EPG}ESTADO_TERMINAL`))).toContain(
      'no admite más cambios',
    );
  });

  it('descargar traduce cada código del paquete', () => {
    // Assert
    expect(
      mensajeErrorDescargarPaquete(errorApi(422, `${P}PAQUETE_ENTREGABLE_NO_DISPONIBLE`)),
    ).toBe('El paquete de este entregable no está disponible.');
    expect(
      mensajeErrorDescargarPaquete(errorApi(422, `${P}PAQUETE_ENTREGABLE_CANCELADO`)),
    ).toContain('está cancelado');
    expect(
      mensajeErrorDescargarPaquete(errorApi(422, `${P}PAQUETE_ENTREGABLE_PROYECTO_CANCELADO`)),
    ).toContain('proyecto está cancelado');
    expect(
      mensajeErrorDescargarPaquete(errorApi(422, `${P}PAQUETE_ENTREGABLE_ACCESO_DENEGADO`)),
    ).toBe('No tienes acceso al paquete de este entregable.');
  });

  it('consulta traduce el asesor no asignado y respalda el resto', () => {
    // Assert
    expect(
      mensajeErrorConsultaEntregable(errorApi(422, `${P}ASESOR_PROYECTO_GRADO_NO_ASIGNADO`)),
    ).toBe('Ya no eres el asesor vigente de este proyecto.');
    expect(mensajeErrorConsultaEntregable(errorApi(500, 'X', 'Falla'))).toBe('Falla');
  });
});
