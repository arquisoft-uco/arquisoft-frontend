import { useCallback, useEffect, useState } from 'react';
import { Plus, Users, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import type { FichaPerfil, PaginaFichasPerfil, Estudiante, AsesorFicha } from '../models/fichas-perfil';
import {
  consultarFichasPerfilCoordinador,
  registrarFichaPerfilCoordinador,
  consultarEstudiantesFichaPerfil,
  asignarEstudianteAFichaPerfil,
  removerEstudianteDeFichaPerfil,
  cambiarAsesorFichaPerfil,
  consultarTodosAsesores,
  consultarTodosEstudiantes,
} from '../services/fichasPerfilMockService';

export default function CoordinadorView() {
  const [pagina, setPagina] = useState<PaginaFichasPerfil | null>(null);
  const [asesores, setAsesores] = useState<AsesorFicha[]>([]);
  const [todosEstudiantes, setTodosEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfil | null>(null);
  const [estudiantesFicha, setEstudiantesFicha] = useState<Estudiante[]>([]);

  // Form state
  const [showCrear, setShowCrear] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [asesorId, setAsesorId] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    const [pag, asesoresData, estudiantesData] = await Promise.all([
      consultarFichasPerfilCoordinador(),
      consultarTodosAsesores(),
      consultarTodosEstudiantes(),
    ]);
    setPagina(pag);
    setAsesores(asesoresData);
    setTodosEstudiantes(estudiantesData);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crearFicha = async () => {
    if (!titulo.trim() || !asesorId) return;
    await registrarFichaPerfilCoordinador({ tituloProyecto: titulo, asesorFichaId: asesorId });
    setTitulo('');
    setAsesorId('');
    setShowCrear(false);
    cargar();
  };

  const verEstudiantes = async (ficha: FichaPerfil) => {
    setFichaSeleccionada(ficha);
    const est = await consultarEstudiantesFichaPerfil(ficha.id);
    setEstudiantesFicha(est);
  };

  const asignarEstudiante = async (estudianteId: string) => {
    if (!fichaSeleccionada) return;
    await asignarEstudianteAFichaPerfil(fichaSeleccionada.id, { estudianteId });
    verEstudiantes(fichaSeleccionada);
  };

  const removerEstudiante = async (estudianteId: string) => {
    if (!fichaSeleccionada) return;
    await removerEstudianteDeFichaPerfil(fichaSeleccionada.id, estudianteId);
    verEstudiantes(fichaSeleccionada);
  };

  const cambiarAsesor = async (fichaId: string, nuevoAsesorId: string) => {
    await cambiarAsesorFichaPerfil(fichaId, { nuevoAsesorFichaId: nuevoAsesorId });
    cargar();
  };


  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-muted" /><div className="h-32 rounded bg-muted" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-on-surface">Fichas de Perfil — Coordinador</h2>
        <div className="flex gap-2">
          <button onClick={cargar} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted" type="button">
            <RefreshCw size={16} aria-hidden /> Actualizar
          </button>
          <button onClick={() => setShowCrear(!showCrear)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90" type="button">
            <Plus size={16} aria-hidden /> Nueva Ficha
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCrear && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-on-surface">Registrar nueva Ficha Perfil</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="titulo" className="mb-1 block text-xs font-medium text-on-surface-secondary">Título del Proyecto</label>
              <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="asesor" className="mb-1 block text-xs font-medium text-on-surface-secondary">Asesor</label>
              <select id="asesor" value={asesorId} onChange={(e) => setAsesorId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary">
                <option value="">Seleccionar asesor...</option>
                {asesores.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowCrear(false)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-on-surface hover:bg-muted" type="button">Cancelar</button>
            <button onClick={crearFicha} disabled={!titulo.trim() || !asesorId} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" type="button">Crear</button>
          </div>
        </div>
      )}

      {/* Fichas table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium text-on-surface-secondary">Título del Proyecto</th>
              <th className="px-4 py-3 font-medium text-on-surface-secondary">Asesor</th>
              <th className="px-4 py-3 font-medium text-on-surface-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagina?.content.map((ficha) => (
              <tr key={ficha.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 text-on-surface">{ficha.tituloProyecto}</td>
                <td className="px-4 py-3">
                  <select value={ficha.asesorFichaId} onChange={(e) => cambiarAsesor(ficha.id, e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary" aria-label={`Asesor de ${ficha.tituloProyecto}`}>
                    {asesores.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => verEstudiantes(ficha)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-muted" type="button">
                    <Users size={14} aria-hidden /> Estudiantes
                  </button>
                </td>
              </tr>
            ))}
            {pagina?.content.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-on-surface-secondary">No hay fichas de perfil registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Student assignment panel */}
      {fichaSeleccionada && (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface">
              Estudiantes — {fichaSeleccionada.tituloProyecto}
            </h3>
            <button onClick={() => setFichaSeleccionada(null)} className="text-xs text-on-surface-secondary hover:text-on-surface" type="button">Cerrar</button>
          </div>
          <div className="space-y-2">
            {estudiantesFicha.map((est) => (
              <div key={est.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-on-surface">{est.nombre}</p>
                  <p className="text-xs text-on-surface-secondary">{est.identificador} — {est.email}</p>
                </div>
                <button onClick={() => removerEstudiante(est.id)} className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50" type="button" aria-label={`Remover a ${est.nombre}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {estudiantesFicha.length === 0 && <p className="text-xs text-on-surface-secondary">No hay estudiantes asignados</p>}
          </div>
          {estudiantesFicha.length < 3 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-on-surface-secondary">Asignar estudiante:</p>
              <div className="flex flex-wrap gap-2">
                {todosEstudiantes
                  .filter((e) => !estudiantesFicha.some((ef) => ef.id === e.id))
                  .map((e) => (
                    <button key={e.id} onClick={() => asignarEstudiante(e.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-on-surface transition-colors hover:bg-primary-muted hover:text-primary" type="button">
                      <UserPlus size={12} aria-hidden /> {e.nombre}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
