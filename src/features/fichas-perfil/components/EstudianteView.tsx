import { useCallback, useEffect, useState } from 'react';
import { Edit3, Trash2, Plus, Users, Eye, MessageSquare } from 'lucide-react';
import type { FichaPerfil, Item, Estudiante, EstadoFichaPerfil, RevisionItem, ObservacionItem, ObservacionEvaluacion, EvaluacionFichaPerfil, TipoItem, EstadoFicha } from '../models/fichas-perfil';
import {
  consultarMiFichaPerfil,
  modificarTituloFichaPerfil,
  consultarCompanerosFichaPerfil,
  consultarItemsMiFichaPerfil,
  agregarItemFichaPerfil,
  modificarItem,
  removerItem,
  consultarEstadoFichaPerfilEstudiante,
  agregarEstadoFichaPerfilEstudiante,
  consultarRevisionesItemsMiFichaPerfil,
  consultarObservacionesItemsMiFichaPerfil,
  consultarEvaluacionesMiFichaPerfil,
  consultarObservacionesEvaluacionMiFichaPerfil,
  consultarTodosTipoItem,
  consultarTodosEstadosFicha,
} from '../services/fichasPerfilMockService';

type Tab = 'items' | 'estados' | 'revisiones' | 'evaluaciones';

export default function EstudianteView() {
  const [ficha, setFicha] = useState<FichaPerfil | null>(null);
  const [companeros, setCompaneros] = useState<Estudiante[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [estados, setEstados] = useState<EstadoFichaPerfil[]>([]);
  const [revisiones, setRevisiones] = useState<RevisionItem[]>([]);
  const [obsItems, setObsItems] = useState<ObservacionItem[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionFichaPerfil[]>([]);
  const [obsEvaluacion, setObsEvaluacion] = useState<ObservacionEvaluacion[]>([]);
  const [tiposItem, setTiposItem] = useState<TipoItem[]>([]);
  const [estadosFicha, setEstadosFicha] = useState<EstadoFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('items');

  // Form state
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [nuevoItemTipo, setNuevoItemTipo] = useState('');
  const [nuevoItemContenido, setNuevoItemContenido] = useState('');
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [editContenido, setEditContenido] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    const [fichaData, companData, itemsData, estadosData, revisData, obsData, evalsData, obsEvData, tiposData, estadosFichaData] = await Promise.all([
      consultarMiFichaPerfil(),
      consultarCompanerosFichaPerfil(),
      consultarItemsMiFichaPerfil(),
      consultarEstadoFichaPerfilEstudiante(),
      consultarRevisionesItemsMiFichaPerfil(),
      consultarObservacionesItemsMiFichaPerfil(),
      consultarEvaluacionesMiFichaPerfil(),
      consultarObservacionesEvaluacionMiFichaPerfil(),
      consultarTodosTipoItem(),
      consultarTodosEstadosFicha(),
    ]);
    setFicha(fichaData ?? null);
    setCompaneros(companData);
    setItems(itemsData);
    setEstados(estadosData);
    setRevisiones(revisData);
    setObsItems(obsData);
    setEvaluaciones(evalsData);
    setObsEvaluacion(obsEvData);
    setTiposItem(tiposData);
    setEstadosFicha(estadosFichaData);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarTitulo = async () => {
    if (!nuevoTitulo.trim()) return;
    const updated = await modificarTituloFichaPerfil({ tituloProyecto: nuevoTitulo });
    setFicha(updated);
    setEditandoTitulo(false);
  };

  const agregarItem = async () => {
    if (!nuevoItemTipo || !nuevoItemContenido.trim()) return;
    await agregarItemFichaPerfil({ tipoItemId: nuevoItemTipo, contenido: nuevoItemContenido });
    setNuevoItemTipo('');
    setNuevoItemContenido('');
    setShowAddItem(false);
    setItems(await consultarItemsMiFichaPerfil());
  };

  const guardarItem = async (itemId: string) => {
    await modificarItem(itemId, { contenido: editContenido });
    setEditandoItemId(null);
    setItems(await consultarItemsMiFichaPerfil());
  };

  const eliminarItem = async (itemId: string) => {
    await removerItem(itemId);
    setItems(await consultarItemsMiFichaPerfil());
  };

  const agregarEstado = async (estadoFichaId: string) => {
    await agregarEstadoFichaPerfilEstudiante({ estadoFichaId });
    setEstados(await consultarEstadoFichaPerfilEstudiante());
  };

  const getNombreTipo = (id: string) => tiposItem.find((t) => t.id === id)?.nombre ?? id;
  const getNombreEstado = (id: string) => estadosFicha.find((e) => e.id === id)?.nombre ?? id;

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-muted" /><div className="h-32 rounded bg-muted" /></div>;
  }

  if (!ficha) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-on-surface">No tienes una ficha de perfil asignada</p>
        <p className="mt-1 text-sm text-on-surface-secondary">Contacta al coordinador para ser asignado a una ficha.</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'items', label: 'Ítems' },
    { key: 'estados', label: 'Estados' },
    { key: 'revisiones', label: 'Revisiones' },
    { key: 'evaluaciones', label: 'Evaluaciones' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with title */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-on-surface-secondary">Mi Ficha de Perfil</p>
            {editandoTitulo ? (
              <div className="flex items-center gap-2">
                <input type="text" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} maxLength={100} className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={guardarTitulo} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" type="button">Guardar</button>
                <button onClick={() => setEditandoTitulo(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-on-surface" type="button">Cancelar</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-on-surface">{ficha.tituloProyecto}</h2>
                <button onClick={() => { setNuevoTitulo(ficha.tituloProyecto); setEditandoTitulo(true); }} className="rounded p-1 text-on-surface-secondary hover:text-primary" type="button" aria-label="Editar título">
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Companions */}
        {companeros.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Users size={14} className="text-on-surface-secondary" aria-hidden />
            <p className="text-xs text-on-surface-secondary">
              Compañeros: {companeros.map((c) => c.nombre).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-secondary hover:text-on-surface'}`}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'items' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface">Ítems de la Ficha</h3>
            <button onClick={() => setShowAddItem(!showAddItem)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90" type="button">
              <Plus size={14} aria-hidden /> Agregar Ítem
            </button>
          </div>

          {showAddItem && (
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <select value={nuevoItemTipo} onChange={(e) => setNuevoItemTipo(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary" aria-label="Tipo de ítem">
                  <option value="">Tipo de ítem...</option>
                  {tiposItem.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
                <input type="text" placeholder="Contenido del ítem" value={nuevoItemContenido} onChange={(e) => setNuevoItemContenido(e.target.value)} maxLength={200} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary sm:col-span-2" />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setShowAddItem(false)} className="rounded-lg border border-border px-2 py-1 text-xs text-on-surface hover:bg-muted" type="button">Cancelar</button>
                <button onClick={agregarItem} disabled={!nuevoItemTipo || !nuevoItemContenido.trim()} className="rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50" type="button">Agregar</button>
              </div>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="inline-block rounded bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{getNombreTipo(item.tipoItemId)}</span>
                  {editandoItemId === item.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input type="text" value={editContenido} onChange={(e) => setEditContenido(e.target.value)} maxLength={200} className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                      <button onClick={() => guardarItem(item.id)} className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground" type="button">Guardar</button>
                      <button onClick={() => setEditandoItemId(null)} className="rounded border border-border px-2 py-1 text-xs" type="button">Cancelar</button>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-on-surface">{item.contenido}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditandoItemId(item.id); setEditContenido(item.contenido); }} className="rounded p-1 text-on-surface-secondary hover:text-primary" type="button" aria-label={`Editar ítem ${getNombreTipo(item.tipoItemId)}`}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => eliminarItem(item.id)} className="rounded p-1 text-on-surface-secondary hover:text-red-500" type="button" aria-label={`Eliminar ítem ${getNombreTipo(item.tipoItemId)}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-8 text-center text-sm text-on-surface-secondary">No hay ítems en la ficha</p>}
        </div>
      )}

      {tab === 'estados' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface">Estados de la Ficha</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {estadosFicha.filter((ef) => ['ef-1', 'ef-2'].includes(ef.id)).map((ef) => (
              <button key={ef.id} onClick={() => agregarEstado(ef.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-primary-muted hover:text-primary" type="button">
                Cambiar a: {ef.nombre}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {estados.sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime()).map((est) => (
              <div key={est.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium text-on-surface">{getNombreEstado(est.estadoFichaId)}</span>
                <span className="text-xs text-on-surface-secondary">{new Date(est.fechaActualizacion).toLocaleDateString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'revisiones' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-on-surface">Revisiones de Ítems</h3>
          {revisiones.map((rev) => {
            const item = items.find((i) => i.id === rev.itemId);
            const obsRev = obsItems.filter((o) => o.revisionItemId === rev.id);
            return (
              <div key={rev.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">
                    <Eye size={14} className="mr-1 inline" aria-hidden />
                    {item ? getNombreTipo(item.tipoItemId) : rev.itemId}
                  </span>
                  <span className="text-xs text-on-surface-secondary">{new Date(rev.fechaCreacion).toLocaleDateString('es-CO')}</span>
                </div>
                {obsRev.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-border pt-2">
                    {obsRev.map((obs) => (
                      <div key={obs.id} className="flex items-start gap-2">
                        <MessageSquare size={12} className="mt-0.5 text-on-surface-secondary" aria-hidden />
                        <p className="text-xs text-on-surface-secondary">{obs.observacion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {revisiones.length === 0 && <p className="py-8 text-center text-sm text-on-surface-secondary">No hay revisiones aún</p>}
        </div>
      )}

      {tab === 'evaluaciones' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-on-surface">Evaluaciones</h3>
          {evaluaciones.map((ev) => {
            const obsEv = obsEvaluacion.filter((o) => o.evaluacionFichaPerfilId === ev.id);
            return (
              <div key={ev.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">Evaluación</span>
                  <span className="text-xs text-on-surface-secondary">{new Date(ev.fechaCreacion).toLocaleDateString('es-CO')}</span>
                </div>
                {obsEv.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-border pt-2">
                    {obsEv.map((obs) => (
                      <div key={obs.id} className="flex items-start gap-2">
                        <MessageSquare size={12} className="mt-0.5 text-on-surface-secondary" aria-hidden />
                        <p className="text-xs text-on-surface-secondary">{obs.observacion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {evaluaciones.length === 0 && <p className="py-8 text-center text-sm text-on-surface-secondary">No hay evaluaciones aún</p>}
        </div>
      )}
    </div>
  );
}
