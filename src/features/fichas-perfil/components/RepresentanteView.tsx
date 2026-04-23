import { useCallback, useEffect, useState } from 'react';
import { Eye, Plus, RefreshCw, Trash2, Edit3, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { FichaPerfil, Item, EstadoFichaPerfil, EvaluacionFichaPerfil, ObservacionEvaluacion, EstadoFicha, EstadoEvaluacion } from '../models/fichas-perfil';
import {
  consultarFichasDisponiblesParaEvaluar,
  consultarItemsFichaPerfilAAprobar,
  consultarEstadoFichaPerfilAEvaluar,
  agregarEstadoFichaPerfilAprobacion,
  registrarEvaluacionFichaPerfil,
  consultarEvaluacionesGeneradas,
  agregarObservacionEvaluacion,
  consultarObservacionesEvaluacionRepresentante,
  modificarObservacionEvaluacion,
  removerObservacionEvaluacion,
  consultarTodosEstadosFicha,
  consultarTodosEstadosEvaluacion,
  agregarEstadoEvaluacionFicha,
} from '../services/fichasPerfilMockService';

type Panel = 'fichas' | 'detalle' | 'evaluaciones';

export default function RepresentanteView() {
  const [fichasDisponibles, setFichasDisponibles] = useState<FichaPerfil[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionFichaPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<Panel>('fichas');

  // Detail
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfil | null>(null);
  const [itemsFicha, setItemsFicha] = useState<Item[]>([]);
  const [estadosFicha, setEstadosFicha] = useState<EstadoFichaPerfil[]>([]);

  // Evaluation detail
  const [evalSeleccionada, setEvalSeleccionada] = useState<EvaluacionFichaPerfil | null>(null);
  const [obsEvaluacion, setObsEvaluacion] = useState<ObservacionEvaluacion[]>([]);

  // Reference
  const [estadosFichaRef, setEstadosFichaRef] = useState<EstadoFicha[]>([]);
  const [estadosEvalRef, setEstadosEvalRef] = useState<EstadoEvaluacion[]>([]);

  // Form state
  const [nuevaObs, setNuevaObs] = useState('');
  const [editandoObsId, setEditandoObsId] = useState<string | null>(null);
  const [editObs, setEditObs] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    const [fichas, evals, efRef, eeRef] = await Promise.all([
      consultarFichasDisponiblesParaEvaluar(),
      consultarEvaluacionesGeneradas(),
      consultarTodosEstadosFicha(),
      consultarTodosEstadosEvaluacion(),
    ]);
    setFichasDisponibles(fichas);
    setEvaluaciones(evals);
    setEstadosFichaRef(efRef);
    setEstadosEvalRef(eeRef);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const verDetalle = async (ficha: FichaPerfil) => {
    setFichaSeleccionada(ficha);
    setPanel('detalle');
    const [itemsData, estadosData] = await Promise.all([
      consultarItemsFichaPerfilAAprobar(ficha.id),
      consultarEstadoFichaPerfilAEvaluar(ficha.id),
    ]);
    setItemsFicha(itemsData);
    setEstadosFicha(estadosData);
  };

  const aprobar = async (estadoFichaId: string) => {
    if (!fichaSeleccionada) return;
    await agregarEstadoFichaPerfilAprobacion(fichaSeleccionada.id, { estadoFichaId });
    setEstadosFicha(await consultarEstadoFichaPerfilAEvaluar(fichaSeleccionada.id));
  };

  const crearEvaluacion = async (fichaPerfilId: string) => {
    const ev = await registrarEvaluacionFichaPerfil({ fichaPerfilId });
    setEvaluaciones(await consultarEvaluacionesGeneradas());
    verEvaluacion(ev);
  };

  const verEvaluacion = async (ev: EvaluacionFichaPerfil) => {
    setEvalSeleccionada(ev);
    setPanel('evaluaciones');
    setObsEvaluacion(await consultarObservacionesEvaluacionRepresentante(ev.id));
  };

  const agregarObs = async () => {
    if (!evalSeleccionada || !nuevaObs.trim()) return;
    await agregarObservacionEvaluacion(evalSeleccionada.id, { observacion: nuevaObs });
    setNuevaObs('');
    setObsEvaluacion(await consultarObservacionesEvaluacionRepresentante(evalSeleccionada.id));
  };

  const guardarObs = async (obsId: string) => {
    await modificarObservacionEvaluacion(obsId, { observacion: editObs });
    setEditandoObsId(null);
    if (evalSeleccionada) setObsEvaluacion(await consultarObservacionesEvaluacionRepresentante(evalSeleccionada.id));
  };

  const eliminarObs = async (obsId: string) => {
    await removerObservacionEvaluacion(obsId);
    if (evalSeleccionada) setObsEvaluacion(await consultarObservacionesEvaluacionRepresentante(evalSeleccionada.id));
  };

  const cambiarEstadoEval = async (estadoEvaluacionId: string) => {
    if (!evalSeleccionada) return;
    await agregarEstadoEvaluacionFicha(evalSeleccionada.id, { estadoEvaluacionId });
  };

  const getNombreEstadoFicha = (id: string) => estadosFichaRef.find((e) => e.id === id)?.nombre ?? id;

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-muted" /><div className="h-32 rounded bg-muted" /></div>;
  }

  // ─── Fichas disponibles ───
  if (panel === 'fichas') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-on-surface">Fichas de Perfil — Representante Comité</h2>
          <button onClick={cargar} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted" type="button">
            <RefreshCw size={16} aria-hidden /> Actualizar
          </button>
        </div>

        {/* Available for evaluation */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Fichas Disponibles para Evaluación</h3>
          {fichasDisponibles.length === 0 ? (
            <p className="py-4 text-center text-sm text-on-surface-secondary">No hay fichas disponibles para evaluar</p>
          ) : (
            <div className="space-y-2">
              {fichasDisponibles.map((ficha) => (
                <div key={ficha.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium text-on-surface">{ficha.tituloProyecto}</span>
                  <div className="flex gap-2">
                    <button onClick={() => verDetalle(ficha)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary-muted" type="button">
                      <Eye size={14} aria-hidden /> Ver Ítems
                    </button>
                    <button onClick={() => crearEvaluacion(ficha.id)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90" type="button">
                      <Plus size={14} aria-hidden /> Evaluar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My evaluations */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Mis Evaluaciones</h3>
          {evaluaciones.length === 0 ? (
            <p className="py-4 text-center text-sm text-on-surface-secondary">No has generado evaluaciones aún</p>
          ) : (
            <div className="space-y-2">
              {evaluaciones.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-on-surface">Evaluación de ficha {ev.fichaPerfilId}</span>
                    <p className="text-xs text-on-surface-secondary">{new Date(ev.fechaCreacion).toLocaleDateString('es-CO')}</p>
                  </div>
                  <button onClick={() => verEvaluacion(ev)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary-muted" type="button">
                    <Eye size={14} aria-hidden /> Ver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Detalle de ficha ───
  if (panel === 'detalle' && fichaSeleccionada) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setPanel('fichas')} className="rounded-lg border border-border px-3 py-1.5 text-sm text-on-surface hover:bg-muted" type="button">&larr; Volver</button>
          <h2 className="text-xl font-semibold text-on-surface">{fichaSeleccionada.tituloProyecto}</h2>
        </div>

        {/* Estado actual */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Estado Actual</h3>
          <div className="space-y-1">
            {estadosFicha.sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime()).map((est) => (
              <div key={est.id} className="flex items-center justify-between rounded bg-muted/50 px-3 py-1.5">
                <span className="text-xs font-medium text-on-surface">{getNombreEstadoFicha(est.estadoFichaId)}</span>
                <span className="text-[10px] text-on-surface-secondary">{new Date(est.fechaActualizacion).toLocaleDateString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aprobación */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Decisión</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => aprobar('ef-5')} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700" type="button">
              <CheckCircle size={14} aria-hidden /> Aprobar
            </button>
            <button onClick={() => aprobar('ef-6')} className="inline-flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600" type="button">
              <AlertCircle size={14} aria-hidden /> Aprobar con Obs.
            </button>
            <button onClick={() => aprobar('ef-7')} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700" type="button">
              <XCircle size={14} aria-hidden /> No Aprobar
            </button>
          </div>
        </div>

        {/* Ítems */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Ítems de la Ficha</h3>
          <div className="space-y-2">
            {itemsFicha.map((item) => (
              <div key={item.id} className="rounded-lg bg-muted/50 p-3">
                <span className="inline-block rounded bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{item.tipoItem.nombre}</span>
                <p className="mt-1 text-sm text-on-surface">{item.contenido}</p>
              </div>
            ))}
            {itemsFicha.length === 0 && <p className="py-4 text-center text-xs text-on-surface-secondary">No hay ítems</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─── Detalle de evaluación ───
  if (panel === 'evaluaciones' && evalSeleccionada) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setPanel('fichas')} className="rounded-lg border border-border px-3 py-1.5 text-sm text-on-surface hover:bg-muted" type="button">&larr; Volver</button>
          <h2 className="text-xl font-semibold text-on-surface">Evaluación</h2>
        </div>

        {/* Estado de evaluación */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Estado de la Evaluación</h3>
          <div className="flex flex-wrap gap-2">
            {estadosEvalRef.map((ee) => (
              <button key={ee.id} onClick={() => cambiarEstadoEval(ee.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-primary-muted hover:text-primary" type="button">
                {ee.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Observaciones</h3>

          {/* Add observation */}
          <div className="mb-3 flex gap-2">
            <input type="text" placeholder="Nueva observación..." value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} maxLength={200} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={agregarObs} disabled={!nuevaObs.trim()} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" type="button">Agregar</button>
          </div>

          <div className="space-y-2">
            {obsEvaluacion.map((obs) => (
              <div key={obs.id} className="flex items-start justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
                {editandoObsId === obs.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input type="text" value={editObs} onChange={(e) => setEditObs(e.target.value)} maxLength={200} className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <button onClick={() => guardarObs(obs.id)} className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground" type="button">Guardar</button>
                    <button onClick={() => setEditandoObsId(null)} className="rounded border border-border px-2 py-1 text-xs" type="button">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="mt-0.5 text-on-surface-secondary" aria-hidden />
                      <p className="text-sm text-on-surface">{obs.observacion}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditandoObsId(obs.id); setEditObs(obs.observacion); }} className="rounded p-1 text-on-surface-secondary hover:text-primary" type="button" aria-label="Editar observación">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => eliminarObs(obs.id)} className="rounded p-1 text-on-surface-secondary hover:text-red-500" type="button" aria-label="Eliminar observación">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {obsEvaluacion.length === 0 && <p className="py-4 text-center text-xs text-on-surface-secondary">No hay observaciones</p>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
