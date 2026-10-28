// Límites alineados con las restricciones @Size del backend.
export const LIMITES = {
  TITULO_PROYECTO_MAX: 100,
  ITEM_CONTENIDO_MAX: 7000,
  ESTADO_EVALUACION_ID_MAX: 50,
  // estado_ficha_perfil.estado_ficha_id VARCHAR(50), FichasLimits.ESTADO_MAX
  ESTADO_FICHA_ID_MAX: 50,
  // ProyectosLimits.EstudianteProyectoGrado.MAX_ESTUDIANTES (proyectos-grado) tiene el mismo valor.
  ESTUDIANTES_MAX: 3,
  // FichasLimits.ObservacionEvaluacion.OBSERVACION_MAX
  OBSERVACION_EVALUACION_MAX: 200,
  // FichasLimits.ObservacionItem.OBSERVACION_MAX
  OBSERVACION_ITEM_MAX: 200,
  // No es un @Size del DTO (record desnudo): origen es la validación de dominio
  // (ApplicationValidationException) de EnviarSolicitudNovedadCoordinador (HU-081), de
  // EnviarSolicitudNovedadAsesor (HU-082) y de EnviarSolicitudCambioAsesor (HU-083), confirmado
  // con 400 real.
  MENSAJE_SOLICITUD_MAX: 100,
  // Origen: ResponderSolicitudNovedadCoordinadorCommand.crear, ResponderSolicitudNovedadAsesorCommand.crear
  // ResponderSolicitudCambioAsesorCommand.crear y ResponderSolicitudAmpliacionPlazoCommand.crear
  // (ValidatorLongitud.longitudEntre(1, 100)),
  // SolicitudesLimits.Respuesta.CONTENIDO_MAX.
  RESPUESTA_CONTENIDO_MAX: 100,
  USUARIO_IDENTIFICADOR_MIN: 4,
  USUARIO_IDENTIFICADOR_MAX: 30,
  USUARIO_NOMBRE_MIN: 2,
  USUARIO_NOMBRE_MAX: 50,
  USUARIO_EMAIL_MIN: 6,
  USUARIO_EMAIL_MAX: 50,
  USUARIO_CONTACTO_MIN: 10,
  USUARIO_CONTACTO_MAX: 15,
  // Espejo de EvaluacionesLimits.ItemCualitativoJurado del backend.
  ITEM_CUALITATIVO_NOMBRE_MAX: 100,
  ITEM_CUALITATIVO_DESCRIPCION_MAX: 300,
  // Espejo de EvaluacionesLimits.ItemCuantitativoJurado del backend.
  ITEM_CUANTITATIVO_NOMBRE_MAX: 100,
  ITEM_CUANTITATIVO_DESCRIPCION_MAX: 300,
  ITEM_CUANTITATIVO_VALOR_MIN: 0,
  ITEM_CUANTITATIVO_VALOR_MAX: 500,
  // EvaluacionesLimits.CategoriaItemCuantitativoJurado.NOMBRE_MAX
  CATEGORIA_ITEM_CUANTITATIVO_NOMBRE_FILTRO_MAX: 100,
  // Espejo de RepositorioArtefactosLimits.RepositorioArtefacto (NOMBRE_MAX, DESCRIPCION_MAX) del backend.
  REPOSITORIO_NOMBRE_MAX: 100,
  REPOSITORIO_DESCRIPCION_MAX: 300,
  // Espejo de RepositorioArtefactosLimits.VersionRepositorioArtefacto (NOMBRE_DOCUMENTO_MAX, NOMBRE_ARCHIVO_MAX).
  VERSION_NOMBRE_DOCUMENTO_MAX: 100,
  VERSION_NOMBRE_ARCHIVO_MAX: 255,
  // repositorio-artefactos.almacenamiento.tamano-maximo-bytes (application.yml del backend).
  VERSION_ARCHIVO_TAMANO_MAX_BYTES: 5_242_880,
} as const;
