import { useCallback, useEffect, useState } from 'react';
import { Eye, Plus, RefreshCw, Trash2, MessageSquare, ClipboardCheck } from 'lucide-react';
import type { FichaPerfil, PaginaFichasPerfil, Item, RevisionItem, ObservacionItem, EstadoFichaPerfil, EvaluacionFichaPerfil, TipoItem, EstadoFicha, EstadoRevision, EstadoObservacionRevision, ObservacionEvaluacion } from '../models/fichas-perfil';
import RegistrarFichaPerfil from './RegistrarFichaPerfil';
import { useQuery } from '@tanstack/react-query';
import { consultarAsesoresDisponibles } from '../services/fichasPerfilMockService';
import {
  consultarFichasPerfilQueAsesora,
  consultarItemsFichaPerfilAsesorada,
  consultarEstadosFichaPerfilQueAsesora,
  agregarEstadoFichaPerfilAsesor,
  consultarEvaluacionesFichaPerfilAsesorada,
  agregarRevisionItem,
  consultarRevisionesItemElaboradas,
  removerRevisionItem,
  agregarObservacionItem,
  consultarObservacionesItemElaboradas,
  removerObservacionItem,
  consultarObservacionesEvaluacionAsesor,
  consultarTodosTipoItem,
  consultarTodosEstadosFicha,
  consultarTodosEstadosRevision,
  consultarTodosEstadosObservacionRevision,
} from '../services/fichasPerfilMockService';

type Panel = 'fichas' | 'detalle';

export default function AsesorFichaView() {
  const [pagina, setPagina] = useState<PaginaFichasPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<Panel>('fichas');
  const [registrarAbierto, setRegistrarAbierto] = useState(false);

  const { data: asesores = [] } = useQuery({
    queryKey: ['asesores-disponibles'],
    queryFn: consultarAsesoresDisponibles,
  });

  // En producción vendrá del token de identidad; en mock usamos el primero disponible.
  const miAsesorId = asesores[0]?.id;

  // Detail state
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfil | null>(null);
  const [itemsFicha, setItemsFicha] = useState<Item[]>([]);
  const [estadosFicha, setEstadosFicha] = useState<EstadoFichaPerfil[]>([]);
  const [evaluacionesFicha, setEvaluacionesFicha] = useState<EvaluacionFichaPerfil[]>([]);
  const [revisiones, setRevisiones] = useState<RevisionItem[]>([]);
  const [observaciones, setObservaciones] = useState<ObservacionItem[]>([]);
  const [obsEvaluacion, setObsEvaluacion] = useState<ObservacionEvaluacion[]>([]);

  // Reference
  const [tiposItem, setTiposItem] = useState<TipoItem[]>([]);
  const [estadosFichaRef, setEstadosFichaRef] = useState<EstadoFicha[]>([]);
  const [estadosRevision, setEstadosRevision] = useState<EstadoRevision[]>([]);
  const [estadosObsRevision, setEstadosObsRevision] = useState<EstadoObservacionRevision[]>([]);

  // Form state
  const [showAddObs, setShowAddObs] = useState<string | null>(null);
  const [nuevaObs, setNuevaObs] = useState('');
  const [obsEstadoId, setObsEstadoId] = useState('');

  const cargarFichas = useCallback(async () => {
    setLoading(true);
    const [pag, tipos, efRef, eRev, eObsRev] = await Promise.all([
      consultarFichasPerfilQueAsesora(),
      consultarTodosTipoItem(),
      consultarTodosEstadosFicha(),
      consultarTodosEstadosRevision(),
      consultarTodosEstadosObservacionRevision(),
    ]);
    setPagina(pag);
    setTiposItem(tipos);
    setEstadosFichaRef(efRef);
    setEstadosRevision(eRev);
    setEstadosObsRevision(eObsRev);
    setLoading(false);
  }, []);

  useEffect(() => { cargarFichas(); }, [cargarFichas]);

  const verDetalle = async (ficha: FichaPerfil) => {
    setFichaSeleccionada(ficha);
    setPanel('detalle');
    const [itemsData, estadosData, evalsData, revsData, obsData, obsEvData] = await Promise.all([
      consultarItemsFichaPerfilAsesorada(ficha.id),
      consultarEstadosFichaPerfilQueAsesora(ficha.id),
      consultarEvaluacionesFichaPerfilAsesorada(ficha.id),
      consultarRevisionesItemElaboradas(),
      consultarObservacionesItemElaboradas(),
      consultarObservacionesEvaluacionAsesor(ficha.id),
    ]);
    setItemsFicha(itemsData);
    setEstadosFicha(estadosData);
    setEvaluacionesFicha(evalsData);
    setRevisiones(revsData);
    setObservaciones(obsData);
    setObsEvaluacion(obsEvData);
  };

  const crearRevision = async (itemId: string, estadoRevisionId: string) => {
    await agregarRevisionItem({ itemId, estadoRevisionId });
    setRevisiones(await consultarRevisionesItemElaboradas());
  };

  const eliminarRevision = async (revisionItemId: string) => {
    await removerRevisionItem(revisionItemId);
    setRevisiones(await consultarRevisionesItemElaboradas());
    setObservaciones(await consultarObservacionesItemElaboradas());
  };

  const crearObservacion = async (revisionItemId: string) => {
    if (!nuevaObs.trim() || !obsEstadoId) return;
    await agregarObservacionItem({ revisionItemId, observacion: nuevaObs, estadoObservacionRevisionId: obsEstadoId });
    setNuevaObs('');
    setObsEstadoId('');
    setShowAddObs(null);
    setObservaciones(await consultarObservacionesItemElaboradas());
  };

  const eliminarObservacion = async (obsId: string) => {
    await removerObservacionItem(obsId);
    setObservaciones(await consultarObservacionesItemElaboradas());
  };

  const cambiarEstadoFicha = async (fichaPerfilId: string, estadoFichaId: string) => {
    await agregarEstadoFichaPerfilAsesor(fichaPerfilId, { estadoFichaId });
    if (fichaSeleccionada) {
      setEstadosFicha(await consultarEstadosFichaPerfilQueAsesora(fichaSeleccionada.id));
    }
  };

  const getNombreTipo = (id: string) => tiposItem.find((t) => t.id === id)?.nombre ?? id;
  const getNombreEstadoFicha = (id: string) => estadosFichaRef.find((e) => e.id === id)?.nombre ?? id;
  const getNombreEstadoRev = (id: string) => estadosRevision.find((e) => e.id === id)?.nombre ?? id;

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-muted" /><div className="h-32 rounded bg-muted" /></div>;
  }

  if (panel === 'fichas') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-on-surface">Fichas de Perfil — Asesor</h2>
          <div className="flex items-center gap-2">
            {!registrarAbierto && (
              <button
                type="button"
                onClick={() => setRegistrarAbierto(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus size={16} aria-hidden />
                Nueva Ficha de Perfil
              </button>
            )}
            <button onClick={cargarFichas} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted" type="button">
              <RefreshCw size={16} aria-hidden /> Actualizar
            </button>
          </div>
        </div>
        {registrarAbierto && miAsesorId && (
          <RegistrarFichaPerfil
            asesorFijoId={miAsesorId}
            onCerrar={() => setRegistrarAbierto(false)}
          />
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium text-on-surface-secondary">Título del Proyecto</th>
                <th className="px-4 py-3 font-medium text-on-surface-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagina?.content.map((ficha) => (
                <tr key={ficha.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-on-surface">{ficha.tituloProyecto}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => verDetalle(ficha)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-muted" type="button">
                      <Eye size={14} aria-hidden /> Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {pagina?.content.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-on-surface-secondary">No hay fichas asignadas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Detail panel
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setPanel('fichas')} className="rounded-lg border border-border px-3 py-1.5 text-sm text-on-surface hover:bg-muted" type="button">&larr; Volver</button>
        <h2 className="text-xl font-semibold text-on-surface">{fichaSeleccionada?.tituloProyecto}</h2>
      </div>

      {/* Estados */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-on-surface">Estados de la Ficha</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {estadosFichaRef.filter((ef) => ['ef-3', 'ef-4'].includes(ef.id)).map((ef) => (
            <button key={ef.id} onClick={() => fichaSeleccionada && cambiarEstadoFicha(fichaSeleccionada.id, ef.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-primary-muted hover:text-primary" type="button">
              Cambiar a: {ef.nombre}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          {estadosFicha.sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime()).map((est) => (
            <div key={est.id} className="flex items-center justify-between rounded bg-muted/50 px-3 py-1.5">
              <span className="text-xs font-medium text-on-surface">{getNombreEstadoFicha(est.estadoFichaId)}</span>
              <span className="text-[10px] text-on-surface-secondary">{new Date(est.fechaActualizacion).toLocaleDateString('es-CO')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ítems + Revisions + Observations */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-on-surface">Ítems y Revisiones</h3>
        <div className="space-y-4">
          {itemsFicha.map((item) => {
            const itemRevs = revisiones.filter((r) => r.itemId === item.id);
            const hasRevision = itemRevs.length > 0;
            return (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block rounded bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{getNombreTipo(item.tipoItemId)}</span>
                    <p className="mt-1 text-sm text-on-surface">{item.contenido}</p>
                  </div>
                  {!hasRevision && (
                    <div className="flex gap-1">
                      {estadosRevision.map((er) => (
                        <button key={er.id} onClick={() => crearRevision(item.id, er.id)} className="rounded border border-border px-2 py-1 text-[10px] font-medium text-on-surface hover:bg-primary-muted hover:text-primary" type="button">
                          <ClipboardCheck size={10} className="mr-1 inline" aria-hidden />{er.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Revisions for this item */}
                {itemRevs.map((rev) => {
                  const obsRev = observaciones.filter((o) => o.revisionItemId === rev.id);
                  return (
                    <div key={rev.id} className="mt-2 rounded bg-muted/30 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-on-surface">
                          Revisión: <span className="text-primary">{getNombreEstadoRev(rev.estadoRevisionId)}</span>
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => setShowAddObs(showAddObs === rev.id ? null : rev.id)} className="rounded p-1 text-on-surface-secondary hover:text-primary" type="button" aria-label="Agregar observación">
                            <Plus size={12} />
                          </button>
                          <button onClick={() => eliminarRevision(rev.id)} className="rounded p-1 text-on-surface-secondary hover:text-red-500" type="button" aria-label="Eliminar revisión">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Add observation form */}
                      {showAddObs === rev.id && (
                        <div className="mt-2 flex gap-2">
                          <input type="text" placeholder="Observación..." value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} maxLength={200} className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary" />
                          <select value={obsEstadoId} onChange={(e) => setObsEstadoId(e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary" aria-label="Estado de la observación">
                            <option value="">Estado...</option>
                            {estadosObsRevision.map((eor) => <option key={eor.id} value={eor.id}>{eor.nombre}</option>)}
                          </select>
                          <button onClick={() => crearObservacion(rev.id)} disabled={!nuevaObs.trim() || !obsEstadoId} className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50" type="button">Agregar</button>
                        </div>
                      )}

                      {/* Observations */}
                      {obsRev.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {obsRev.map((obs) => (
                            <div key={obs.id} className="flex items-start justify-between gap-2 rounded bg-background px-2 py-1">
                              <div className="flex items-start gap-1">
                                <MessageSquare size={10} className="mt-0.5 text-on-surface-secondary" aria-hidden />
                                <p className="text-[11px] text-on-surface-secondary">{obs.observacion}</p>
                              </div>
                              <button onClick={() => eliminarObservacion(obs.id)} className="rounded p-0.5 text-on-surface-secondary hover:text-red-500" type="button" aria-label="Eliminar observación">
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {itemsFicha.length === 0 && <p className="py-6 text-center text-xs text-on-surface-secondary">No hay ítems en esta ficha</p>}
        </div>
      </div>

      {/* Evaluaciones & Observaciones de evaluación */}
      {evaluacionesFicha.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Evaluaciones</h3>
          {evaluacionesFicha.map((ev) => {
            const obsEv = obsEvaluacion.filter((o) => o.evaluacionFichaPerfilId === ev.id);
            return (
              <div key={ev.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">Evaluación</span>
                  <span className="text-xs text-on-surface-secondary">{new Date(ev.fechaCreacion).toLocaleDateString('es-CO')}</span>
                </div>
                {obsEv.map((obs) => (
                  <div key={obs.id} className="mt-1 flex items-start gap-1">
                    <MessageSquare size={10} className="mt-0.5 text-on-surface-secondary" aria-hidden />
                    <p className="text-xs text-on-surface-secondary">{obs.observacion}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
