import type {
  EstadoFicha,
  EstadoEvaluacion,
  EstadoRevision,
  EstadoObservacionRevision,
  TipoItem,
  Estudiante as EstudianteInterno,
  AsesorFicha,
  RepresentanteComiteCurriculum,
  FichaPerfil as FichaPerfilInterna,
  PaginaFichasPerfil,
  EstudianteFichaPerfil,
  EstadoFichaPerfil,
  Item,
  RevisionItem,
  ObservacionItem,
  EvaluacionFichaPerfil,
  EstadoEvaluacionFicha,
  ObservacionEvaluacion,
  CrearFichaPerfilRequest,
  CrearItemRequest,
  CrearRevisionItemRequest,
  CrearObservacionItemRequest,
  CrearEvaluacionFichaPerfilRequest,
  CrearObservacionEvaluacionRequest,
  ModificarObservacionRequest,
  ItemCreadoResponse,
  ModificarItemRequest,
  ModificarRevisionItemRequest,
  AgregarEstadoFichaPerfilRequest,
  AgregarEstadoAprobacionRequest,
  AgregarEstadoEvaluacionRequest,
} from '../models/fichas-perfil';
import type { Page } from '../../../shared/models/api-response';
import type { Asesor } from '../models/Asesor';
import type { Estudiante } from '../models/Estudiante';
import type { AsignarEstudianteRequest } from '../models/AsignarEstudianteRequest';
import type { AsignarEstudianteResponse } from '../models/AsignarEstudianteResponse';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';
import type { FichaPerfilCreadaResponse } from '../models/FichaPerfilCreadaResponse';
import type { FichaPerfil } from '../models/FichaPerfil';
import type { RegistrarFichaPerfilRequest } from '../models/RegistrarFichaPerfilRequest';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import type { ModificarFichaPerfilRequest } from '../models/ModificarFichaPerfilRequest';

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const ESTADOS_FICHA: EstadoFicha[] = [
  { id: 'ef-1', nombre: 'En Construccion', descripcion: 'La ficha está siendo desarrollada por los estudiantes' },
  { id: 'ef-2', nombre: 'Disponible Revisar', descripcion: 'La ficha está lista para ser revisada por el asesor' },
  { id: 'ef-3', nombre: 'En Revision', descripcion: 'La ficha está siendo revisada por el asesor' },
  { id: 'ef-4', nombre: 'Disponible Evaluar', descripcion: 'La ficha está lista para ser evaluada por el comité' },
  { id: 'ef-5', nombre: 'Aprobada', descripcion: 'La ficha fue aprobada por el comité' },
  { id: 'ef-6', nombre: 'Aprobada con Obs.', descripcion: 'La ficha fue aprobada con observaciones' },
  { id: 'ef-7', nombre: 'No Aprobada', descripcion: 'La ficha no fue aprobada por el comité' },
];

const ESTADOS_EVALUACION: EstadoEvaluacion[] = [
  { id: 'ee-1', nombre: 'Pendiente', descripcion: 'La evaluación está pendiente' },
  { id: 'ee-2', nombre: 'En Progreso', descripcion: 'La evaluación está en progreso' },
  { id: 'ee-3', nombre: 'Completada', descripcion: 'La evaluación fue completada' },
];

const ESTADOS_REVISION: EstadoRevision[] = [
  { id: 'er-1', nombre: 'Pendiente', descripcion: 'La revisión está pendiente' },
  { id: 'er-2', nombre: 'Aprobado', descripcion: 'El ítem fue aprobado' },
  { id: 'er-3', nombre: 'Rechazado', descripcion: 'El ítem fue rechazado' },
];

const ESTADOS_OBS_REVISION: EstadoObservacionRevision[] = [
  { id: 'eor-1', nombre: 'Abierta', descripcion: 'La observación está abierta' },
  { id: 'eor-2', nombre: 'Resuelta', descripcion: 'La observación fue resuelta' },
];

const TIPOS_ITEM: TipoItem[] = [
  { id: 'ti-1', nombre: 'Titulo', descripcion: 'Título del proyecto' },
  { id: 'ti-2', nombre: 'Planteamiento', descripcion: 'Planteamiento del problema' },
  { id: 'ti-3', nombre: 'Justificación', descripcion: 'Justificación del proyecto' },
  { id: 'ti-4', nombre: 'Objetivo General', descripcion: 'Objetivo general del proyecto' },
  { id: 'ti-5', nombre: 'Obj. Específicos', descripcion: 'Objetivos específicos del proyecto' },
  { id: 'ti-6', nombre: 'Alcance', descripcion: 'Alcance del proyecto' },
];

const ESTUDIANTES: EstudianteInterno[] = [
  { id: 'est-1', identificador: '20201001', nombre: 'Carlos Martínez', email: 'carlos@est.edu.co' },
  { id: 'est-2', identificador: '20201002', nombre: 'María López', email: 'maria@est.edu.co' },
  { id: 'est-3', identificador: '20201003', nombre: 'Juan García', email: 'juan@est.edu.co' },
  { id: 'est-4', identificador: '20201004', nombre: 'Ana Torres', email: 'ana@est.edu.co' },
];

const ASESORES: AsesorFicha[] = [
  { id: 'asf-1', identificador: 'DOC001', nombre: 'Dr. Roberto Díaz', email: 'rdiaz@edu.co' },
  { id: 'asf-2', identificador: 'DOC002', nombre: 'Dra. Patricia Ruiz', email: 'pruiz@edu.co' },
];

const REPRESENTANTES: RepresentanteComiteCurriculum[] = [
  { id: 'rep-1', identificador: 'REP001', nombre: 'Ing. Fernando Castillo', email: 'fcastillo@edu.co' },
  { id: 'rep-2', identificador: 'REP002', nombre: 'Ing. Laura Mendoza', email: 'lmendoza@edu.co' },
];

let fichasPerfil: FichaPerfilInterna[] = [
  { id: 'fp-1', tituloProyecto: 'Sistema de Gestión Académica con Microservicios', asesorFichaId: 'asf-1' },
  { id: 'fp-2', tituloProyecto: 'Plataforma IoT para Monitoreo Ambiental', asesorFichaId: 'asf-2' },
  { id: 'fp-3', tituloProyecto: 'Análisis de Sentimientos en Redes Sociales con IA', asesorFichaId: 'asf-1' },
  { id: 'fp-4', tituloProyecto: 'Aplicación Móvil para Gestión de Inventarios', asesorFichaId: 'asf-2' },
  { id: 'fp-5', tituloProyecto: 'Sistema de Recomendación Basado en Machine Learning', asesorFichaId: 'asf-1' },
  { id: 'fp-6', tituloProyecto: 'Plataforma de E-Learning con Gamificación', asesorFichaId: 'asf-2' },
  { id: 'fp-7', tituloProyecto: 'Integración de Blockchain en Cadenas de Suministro', asesorFichaId: 'asf-1' },
  { id: 'fp-8', tituloProyecto: 'Dashboard de Business Intelligence para PYMES', asesorFichaId: 'asf-2' },
  { id: 'fp-9', tituloProyecto: 'Chatbot Universitario con Procesamiento de Lenguaje Natural', asesorFichaId: 'asf-1' },
  { id: 'fp-10', tituloProyecto: 'Sistema de Detección de Fraude en Transacciones Bancarias', asesorFichaId: 'asf-2' },
  { id: 'fp-11', tituloProyecto: 'Plataforma de Telemedicina con Videoconsultas', asesorFichaId: 'asf-1' },
  { id: 'fp-12', tituloProyecto: 'Automatización de Pruebas con Inteligencia Artificial', asesorFichaId: 'asf-2' },
];

let estudiantesFichaPerfil: EstudianteFichaPerfil[] = [
  { id: 'efp-1', fichaPerfilId: 'fp-1', estudianteId: 'est-1' },
  { id: 'efp-2', fichaPerfilId: 'fp-1', estudianteId: 'est-2' },
  { id: 'efp-3', fichaPerfilId: 'fp-2', estudianteId: 'est-3' },
];

let estadosFichaPerfil: EstadoFichaPerfil[] = [
  { id: 'esfp-1', fichaPerfilId: 'fp-1', estadoFichaId: 'ef-1', fechaActualizacion: '2026-03-01T10:00:00Z' },
  { id: 'esfp-2', fichaPerfilId: 'fp-2', estadoFichaId: 'ef-2', fechaActualizacion: '2026-03-15T14:00:00Z' },
  { id: 'esfp-3', fichaPerfilId: 'fp-3', estadoFichaId: 'ef-4', fechaActualizacion: '2026-04-01T09:00:00Z' },
];

let items: ItemInterno[] = [
  { id: 'item-1', tipoItemId: 'ti-1', contenido: 'Sistema de Gestión Académica con Microservicios', fichaPerfilId: 'fp-1' },
  { id: 'item-2', tipoItemId: 'ti-2', contenido: 'Las universidades requieren sistemas escalables para la gestión académica moderna.', fichaPerfilId: 'fp-1' },
  { id: 'item-3', tipoItemId: 'ti-3', contenido: 'Mejorar la eficiencia y escalabilidad de los procesos académicos.', fichaPerfilId: 'fp-1' },
  { id: 'item-4', tipoItemId: 'ti-4', contenido: 'Diseñar e implementar un sistema basado en arquitectura de microservicios.', fichaPerfilId: 'fp-1' },
  { id: 'item-5', tipoItemId: 'ti-1', contenido: 'Plataforma IoT para Monitoreo Ambiental', fichaPerfilId: 'fp-2' },
  { id: 'item-6', tipoItemId: 'ti-2', contenido: 'Falta de datos en tiempo real sobre condiciones ambientales en campus.', fichaPerfilId: 'fp-2' },
];

let revisionesItem: RevisionItem[] = [
  { id: 'ri-1', itemId: 'item-1', estadoRevisionId: 'er-2', fechaCreacion: '2026-03-10T10:00:00Z' },
  { id: 'ri-2', itemId: 'item-2', estadoRevisionId: 'er-3', fechaCreacion: '2026-03-10T10:30:00Z' },
  { id: 'ri-3', itemId: 'item-5', estadoRevisionId: 'er-1', fechaCreacion: '2026-03-20T14:00:00Z' },
];

let observacionesItem: ObservacionItem[] = [
  { id: 'oi-1', revisionItemId: 'ri-2', observacion: 'Ampliar el planteamiento del problema con cifras concretas.', estadoObservacionRevisionId: 'eor-1' },
  { id: 'oi-2', revisionItemId: 'ri-3', observacion: 'El título es correcto, pero se sugiere agregar el contexto geográfico.', estadoObservacionRevisionId: 'eor-1' },
];

let evaluaciones: EvaluacionFichaPerfil[] = [
  { id: 'eval-1', representanteComiteId: 'rep-1', fichaPerfilId: 'fp-3', fechaCreacion: '2026-04-05T10:00:00Z' },
];

let estadosEvaluacion: EstadoEvaluacionFicha[] = [
  { id: 'esev-1', evaluacionFichaPerfilId: 'eval-1', estadoEvaluacionId: 'ee-2', fechaActualizacion: '2026-04-05T10:00:00Z' },
];

let observacionesEvaluacion: ObservacionEvaluacion[] = [
  { id: 'oev-1', evaluacionFichaPerfilId: 'eval-1', observacion: 'Se recomienda fortalecer la justificación del uso de IA.' },
];

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

type ItemInterno = { id: string; tipoItemId: string; contenido: string; fichaPerfilId: string };

function enrichItem(item: ItemInterno): Item {
  const tipo = TIPOS_ITEM.find((t) => t.id === item.tipoItemId) ?? { id: item.tipoItemId, nombre: item.tipoItemId };
  return { id: item.id, tipoItem: { id: tipo.id, nombre: tipo.nombre }, contenido: item.contenido, fichaPerfilId: item.fichaPerfilId };
}

function uid(): string {
  return crypto.randomUUID();
}

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function paginate(list: FichaPerfilInterna[], page: number, size: number): PaginaFichasPerfil {
  const start = page * size;
  return {
    content: list.slice(start, start + size),
    totalElements: list.length,
    totalPages: Math.ceil(list.length / size),
    page,
    size,
  };
}

function paginateDTO(list: FichaPerfilInterna[], page: number, size: number): Page<FichaPerfil> {
  const start = page * size;
  const slice = list.slice(start, start + size);
  const content: FichaPerfil[] = slice.map((f) => {
    const asesorData = ASESORES.find((a) => a.id === f.asesorFichaId)!;
    return {
      id: f.id,
      titulo: f.tituloProyecto,
      asesor: { id: asesorData.id, nombre: asesorData.nombre, email: asesorData.email },
    };
  });
  return {
    content,
    totalElements: list.length,
    totalPages: Math.ceil(list.length / size),
    size,
    number: page,
  };
}

// ═══════════════════════════════════════════════════════════════════
// SHARED (Compartido)
// ═══════════════════════════════════════════════════════════════════

export function consultarTodosEstadosFicha(): Promise<EstadoFicha[]> {
  return delay([...ESTADOS_FICHA]);
}

export function consultarTodosEstadosEvaluacion(): Promise<EstadoEvaluacion[]> {
  return delay([...ESTADOS_EVALUACION]);
}

export function consultarTodosEstadosRevision(): Promise<EstadoRevision[]> {
  return delay([...ESTADOS_REVISION]);
}

export function consultarTodosEstadosObservacionRevision(): Promise<EstadoObservacionRevision[]> {
  return delay([...ESTADOS_OBS_REVISION]);
}

export function consultarTodosTipoItem(): Promise<TipoItem[]> {
  return delay([...TIPOS_ITEM]);
}

export function consultarEstudiante(identificador: string): Promise<EstudianteInterno | undefined> {
  return delay(ESTUDIANTES.find((e) => e.identificador === identificador || e.id === identificador));
}

export function consultarAsesorFicha(identificador: string): Promise<AsesorFicha | undefined> {
  return delay(ASESORES.find((a) => a.identificador === identificador || a.id === identificador));
}

export function consultarRepresentanteComite(identificador: string): Promise<RepresentanteComiteCurriculum | undefined> {
  return delay(REPRESENTANTES.find((r) => r.identificador === identificador || r.id === identificador));
}

export function consultarEstudiantesDisponibles(): Promise<Estudiante[]> {
  const estudiantes: Estudiante[] = ESTUDIANTES.map((e) => ({ id: e.id, nombre: e.nombre, email: e.email }));
  return delay(estudiantes);
}

export function consultarAsesoresDisponibles(): Promise<Asesor[]> {
  const asesores: Asesor[] = ASESORES.map((a) => ({ id: a.id, nombre: a.nombre, email: a.email }));
  return delay(asesores);
}

// ═══════════════════════════════════════════════════════════════════
// COORDINADOR
// ═══════════════════════════════════════════════════════════════════

export function registrarFichaPerfilCoordinador(req: CrearFichaPerfilRequest): Promise<FichaPerfilInterna> {
  const ficha: FichaPerfilInterna = { id: uid(), tituloProyecto: req.tituloProyecto, asesorFichaId: req.asesorFichaId };
  fichasPerfil = [...fichasPerfil, ficha];
  estadosFichaPerfil = [...estadosFichaPerfil, { id: uid(), fichaPerfilId: ficha.id, estadoFichaId: 'ef-1', fechaActualizacion: new Date().toISOString() }];
  return delay(ficha);
}

export function registrarFichaPerfil(req: RegistrarFichaPerfilRequest): Promise<FichaPerfilCreadaResponse> {
  if (req.idEstudiantes.length < 1 || req.idEstudiantes.length > 3) {
    return Promise.reject(new Error('Debe asignar entre 1 y 3 estudiantes'));
  }
  if (new Set(req.idEstudiantes).size !== req.idEstudiantes.length) {
    return Promise.reject(new Error('No se puede asignar el mismo estudiante más de una vez'));
  }
  const ficha: FichaPerfilInterna = { id: uid(), tituloProyecto: req.titulo, asesorFichaId: req.idAsesorFicha };
  fichasPerfil = [...fichasPerfil, ficha];
  estadosFichaPerfil = [...estadosFichaPerfil, { id: uid(), fichaPerfilId: ficha.id, estadoFichaId: 'ef-1', fechaActualizacion: new Date().toISOString() }];
  req.idEstudiantes.forEach((estudianteId) => {
    estudiantesFichaPerfil = [...estudiantesFichaPerfil, { id: uid(), fichaPerfilId: ficha.id, estudianteId }];
  });
  return delay({ id: ficha.id });
}

export function consultarFichasPerfilCoordinador(page = 0, size = 10): Promise<Page<FichaPerfil>> {
  return delay(paginateDTO(fichasPerfil, page, size));
}

export function cambiarAsesor(req: CambiarAsesorRequest): Promise<void> {
  const idx = fichasPerfil.findIndex((f) => f.id === req.idFicha);
  if (idx === -1) return Promise.reject(new Error('Ficha no encontrada'));
  if (fichasPerfil[idx].asesorFichaId === req.idAsesorFicha)
    return Promise.reject(new Error('El asesor nuevo es el mismo que el actual'));
  fichasPerfil = fichasPerfil.map((f) =>
    f.id === req.idFicha ? { ...f, asesorFichaId: req.idAsesorFicha } : f,
  );
  return delay(undefined);
}

export function asignarEstudiante(req: AsignarEstudianteRequest): Promise<AsignarEstudianteResponse> {
  const actuales = estudiantesFichaPerfil.filter((e) => e.fichaPerfilId === req.idFichaPerfil);
  if (actuales.length >= 3) {
    return Promise.reject(new Error('No se pueden asignar más de 3 estudiantes a una ficha de perfil'));
  }
  const yaAsignado = actuales.some((e) => e.estudianteId === req.idEstudiante);
  if (yaAsignado) {
    return Promise.reject(new Error('El estudiante ya está vinculado a esta ficha de perfil'));
  }
  const idVinculo = uid();
  const rel: EstudianteFichaPerfil = { id: idVinculo, fichaPerfilId: req.idFichaPerfil, estudianteId: req.idEstudiante };
  estudiantesFichaPerfil = [...estudiantesFichaPerfil, rel];
  return delay({ idVinculo });
}

export function consultarEstudiantesFichaPerfil(fichaPerfilId: string): Promise<EstudianteInterno[]> {
  const ids = estudiantesFichaPerfil.filter((e) => e.fichaPerfilId === fichaPerfilId).map((e) => e.estudianteId);
  return delay(ESTUDIANTES.filter((e) => ids.includes(e.id)));
}

export function consultarEstudiantesVinculados(fichaPerfilId: string): Promise<EstudianteVinculado[]> {
  const vinculos = estudiantesFichaPerfil.filter((e) => e.fichaPerfilId === fichaPerfilId);
  const result: EstudianteVinculado[] = vinculos.map((v) => {
    const est = ESTUDIANTES.find((e) => e.id === v.estudianteId)!;
    return { idVinculo: v.id, id: est.id, nombre: est.nombre, email: est.email };
  });
  return delay(result);
}

export function removerEstudiante(idVinculo: string): Promise<void> {
  estudiantesFichaPerfil = estudiantesFichaPerfil.filter((e) => e.id !== idVinculo);
  return delay(undefined);
}

// ═══════════════════════════════════════════════════════════════════
// ESTUDIANTE
// ═══════════════════════════════════════════════════════════════════

/** In a real app, the backend resolves "mi ficha" from the JWT. Here we default to fp-1. */
const MI_FICHA_ID = 'fp-1';

export function consultarMiFichaPerfil(): Promise<FichaPerfilInterna | undefined> {
  return delay(fichasPerfil.find((f) => f.id === MI_FICHA_ID));
}

export function getMiFichaPerfil(): Promise<MiFichaPerfilResponse> {
  const ficha = fichasPerfil.find((f) => f.id === MI_FICHA_ID);
  if (!ficha) return Promise.reject(new Error('El estudiante no está vinculado a ninguna ficha de perfil'));
  const asesorData = ASESORES.find((a) => a.id === ficha.asesorFichaId)!;
  const estadosOrdenados = estadosFichaPerfil
    .filter((e) => e.fichaPerfilId === MI_FICHA_ID)
    .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime());
  const ultimoEstado = estadosOrdenados[0];
  const estadoData = ultimoEstado ? ESTADOS_FICHA.find((ef) => ef.id === ultimoEstado.estadoFichaId)! : ESTADOS_FICHA[0];
  return delay({
    id: ficha.id,
    tituloProyecto: ficha.tituloProyecto,
    asesor: { id: asesorData.id, nombre: asesorData.nombre, email: asesorData.email },
    estadoActual: { id: estadoData.id, nombre: estadoData.nombre, fechaActualizacion: ultimoEstado?.fechaActualizacion ?? new Date().toISOString() },
  });
}

export function modificarTituloFichaPerfil(req: ModificarFichaPerfilRequest): Promise<void> {
  fichasPerfil = fichasPerfil.map((f) => (f.id === req.fichaPerfilId ? { ...f, tituloProyecto: req.tituloProyecto } : f));
  return delay(undefined);
}

export function consultarCompanerosFichaPerfil(): Promise<EstudianteInterno[]> {
  return consultarEstudiantesFichaPerfil(MI_FICHA_ID);
}

export function agregarItemFichaPerfil(req: CrearItemRequest): Promise<ItemCreadoResponse> {
  const interno: ItemInterno = { id: uid(), tipoItemId: req.tipoItemId, contenido: req.contenido, fichaPerfilId: req.fichaPerfilId };
  items = [...items, interno];
  return delay({ id: interno.id });
}

export function consultarItemsMiFichaPerfil(): Promise<Item[]> {
  return delay(items.filter((i) => i.fichaPerfilId === MI_FICHA_ID).map(enrichItem));
}

export function modificarItem(req: ModificarItemRequest): Promise<void> {
  items = items.map((i) => (i.id === req.itemId ? { ...i, contenido: req.contenido } : i));
  return delay(undefined);
}

export function removerItem(itemId: string): Promise<void> {
  items = items.filter((i) => i.id !== itemId);
  return delay(undefined);
}

// ═══════════════════════════════════════════════════════════════════
// ASESOR FICHA
// ═══════════════════════════════════════════════════════════════════

const MI_ASESOR_ID = 'asf-1';

export function registrarFichaPerfilAsesor(req: CrearFichaPerfilRequest): Promise<FichaPerfilInterna> {
  const ficha: FichaPerfilInterna = { id: uid(), tituloProyecto: req.tituloProyecto, asesorFichaId: MI_ASESOR_ID };
  fichasPerfil = [...fichasPerfil, ficha];
  estadosFichaPerfil = [...estadosFichaPerfil, { id: uid(), fichaPerfilId: ficha.id, estadoFichaId: 'ef-1', fechaActualizacion: new Date().toISOString() }];
  return delay(ficha);
}

export function consultarFichasPerfilQueAsesora(page = 0, size = 10): Promise<PaginaFichasPerfil> {
  const misFichas = fichasPerfil.filter((f) => f.asesorFichaId === MI_ASESOR_ID);
  return delay(paginate(misFichas, page, size));
}

export function agregarEstadoFichaPerfilAsesor(fichaPerfilId: string, req: AgregarEstadoFichaPerfilRequest): Promise<EstadoFichaPerfil> {
  const estado: EstadoFichaPerfil = { id: uid(), fichaPerfilId, estadoFichaId: req.estadoFichaId, fechaActualizacion: new Date().toISOString() };
  estadosFichaPerfil = [...estadosFichaPerfil, estado];
  return delay(estado);
}

export function consultarEstadosFichaPerfilQueAsesora(fichaPerfilId: string): Promise<EstadoFichaPerfil[]> {
  return delay(estadosFichaPerfil.filter((e) => e.fichaPerfilId === fichaPerfilId));
}

export function consultarItemsFichaPerfilAsesorada(fichaPerfilId: string): Promise<Item[]> {
  return delay(items.filter((i) => i.fichaPerfilId === fichaPerfilId).map(enrichItem));
}

export function consultarEvaluacionesFichaPerfilAsesorada(fichaPerfilId: string): Promise<EvaluacionFichaPerfil[]> {
  return delay(evaluaciones.filter((e) => e.fichaPerfilId === fichaPerfilId));
}

export function agregarRevisionItem(req: CrearRevisionItemRequest): Promise<RevisionItem> {
  const rev: RevisionItem = { id: uid(), itemId: req.itemId, estadoRevisionId: req.estadoRevisionId, fechaCreacion: new Date().toISOString() };
  revisionesItem = [...revisionesItem, rev];
  return delay(rev);
}

export function consultarRevisionesItemElaboradas(): Promise<RevisionItem[]> {
  return delay([...revisionesItem]);
}

export function modificarRevisionItem(revisionItemId: string, req: ModificarRevisionItemRequest): Promise<RevisionItem> {
  revisionesItem = revisionesItem.map((r) => (r.id === revisionItemId ? { ...r, estadoRevisionId: req.estadoRevisionId } : r));
  return delay(revisionesItem.find((r) => r.id === revisionItemId)!);
}

export function removerRevisionItem(revisionItemId: string): Promise<void> {
  observacionesItem = observacionesItem.filter((o) => o.revisionItemId !== revisionItemId);
  revisionesItem = revisionesItem.filter((r) => r.id !== revisionItemId);
  return delay(undefined);
}

export function agregarObservacionItem(req: CrearObservacionItemRequest): Promise<ObservacionItem> {
  const obs: ObservacionItem = { id: uid(), revisionItemId: req.revisionItemId, observacion: req.observacion, estadoObservacionRevisionId: req.estadoObservacionRevisionId };
  observacionesItem = [...observacionesItem, obs];
  return delay(obs);
}

export function consultarObservacionesItemElaboradas(): Promise<ObservacionItem[]> {
  return delay([...observacionesItem]);
}

export function modificarObservacionItem(observacionItemId: string, req: ModificarObservacionRequest): Promise<ObservacionItem> {
  observacionesItem = observacionesItem.map((o) => (o.id === observacionItemId ? { ...o, observacion: req.observacion } : o));
  return delay(observacionesItem.find((o) => o.id === observacionItemId)!);
}

export function removerObservacionItem(observacionItemId: string): Promise<void> {
  observacionesItem = observacionesItem.filter((o) => o.id !== observacionItemId);
  return delay(undefined);
}

export function consultarObservacionesEvaluacionAsesor(fichaPerfilId: string): Promise<ObservacionEvaluacion[]> {
  const evalIds = evaluaciones.filter((e) => e.fichaPerfilId === fichaPerfilId).map((e) => e.id);
  return delay(observacionesEvaluacion.filter((o) => evalIds.includes(o.evaluacionFichaPerfilId)));
}

// ═══════════════════════════════════════════════════════════════════
// REPRESENTANTE COMITÉ CURRÍCULUM
// ═══════════════════════════════════════════════════════════════════

const MI_REPRESENTANTE_ID = 'rep-1';

export function consultarEstadoFichaPerfilAEvaluar(fichaPerfilId: string): Promise<EstadoFichaPerfil[]> {
  return delay(estadosFichaPerfil.filter((e) => e.fichaPerfilId === fichaPerfilId));
}

export function agregarEstadoFichaPerfilAprobacion(fichaPerfilId: string, req: AgregarEstadoAprobacionRequest): Promise<EstadoFichaPerfil> {
  const estado: EstadoFichaPerfil = { id: uid(), fichaPerfilId, estadoFichaId: req.estadoFichaId, fechaActualizacion: new Date().toISOString() };
  estadosFichaPerfil = [...estadosFichaPerfil, estado];
  return delay(estado);
}

export function consultarItemsFichaPerfilAAprobar(fichaPerfilId: string): Promise<Item[]> {
  return delay(items.filter((i) => i.fichaPerfilId === fichaPerfilId).map(enrichItem));
}

export function registrarEvaluacionFichaPerfil(req: CrearEvaluacionFichaPerfilRequest): Promise<EvaluacionFichaPerfil> {
  const ev: EvaluacionFichaPerfil = { id: uid(), representanteComiteId: MI_REPRESENTANTE_ID, fichaPerfilId: req.fichaPerfilId, fechaCreacion: new Date().toISOString() };
  evaluaciones = [...evaluaciones, ev];
  return delay(ev);
}

export function consultarEvaluacionesGeneradas(): Promise<EvaluacionFichaPerfil[]> {
  return delay(evaluaciones.filter((e) => e.representanteComiteId === MI_REPRESENTANTE_ID));
}

export function agregarEstadoEvaluacionFicha(evaluacionId: string, req: AgregarEstadoEvaluacionRequest): Promise<EstadoEvaluacionFicha> {
  const estado: EstadoEvaluacionFicha = { id: uid(), evaluacionFichaPerfilId: evaluacionId, estadoEvaluacionId: req.estadoEvaluacionId, fechaActualizacion: new Date().toISOString() };
  estadosEvaluacion = [...estadosEvaluacion, estado];
  return delay(estado);
}

export function agregarObservacionEvaluacion(evaluacionId: string, req: CrearObservacionEvaluacionRequest): Promise<ObservacionEvaluacion> {
  const obs: ObservacionEvaluacion = { id: uid(), evaluacionFichaPerfilId: evaluacionId, observacion: req.observacion };
  observacionesEvaluacion = [...observacionesEvaluacion, obs];
  return delay(obs);
}

export function consultarObservacionesEvaluacionRepresentante(evaluacionId: string): Promise<ObservacionEvaluacion[]> {
  return delay(observacionesEvaluacion.filter((o) => o.evaluacionFichaPerfilId === evaluacionId));
}

export function modificarObservacionEvaluacion(observacionEvaluacionId: string, req: ModificarObservacionRequest): Promise<ObservacionEvaluacion> {
  observacionesEvaluacion = observacionesEvaluacion.map((o) => (o.id === observacionEvaluacionId ? { ...o, observacion: req.observacion } : o));
  return delay(observacionesEvaluacion.find((o) => o.id === observacionEvaluacionId)!);
}

export function removerObservacionEvaluacion(observacionEvaluacionId: string): Promise<void> {
  observacionesEvaluacion = observacionesEvaluacion.filter((o) => o.id !== observacionEvaluacionId);
  return delay(undefined);
}

export function consultarFichasDisponiblesParaEvaluar(): Promise<FichaPerfilInterna[]> {
  const fichasDisponibles = estadosFichaPerfil
    .filter((e) => e.estadoFichaId === 'ef-4')
    .map((e) => e.fichaPerfilId);
  return delay(fichasPerfil.filter((f) => fichasDisponibles.includes(f.id)));
}
