import { useState } from 'react';
import { Edit3, Users, UserCheck } from 'lucide-react';
import { useMiFichaPerfil } from '../../hooks/useMiFichaPerfil';

export default function MiFichaHeader() {
  const { ficha, companeros, modificarTitulo } = useMiFichaPerfil();

  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');

  const handleIniciarEdicion = () => {
    setNuevoTitulo(ficha?.tituloProyecto ?? '');
    setEditandoTitulo(true);
  };

  const handleGuardarTitulo = () => {
    if (!nuevoTitulo.trim()) return;
    modificarTitulo.mutate(nuevoTitulo, {
      onSuccess: () => setEditandoTitulo(false),
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoTitulo(false);
  };

  if (!ficha) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-on-surface-secondary">
            Mi Ficha de Perfil
          </p>
          {editandoTitulo ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                maxLength={100}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                aria-label="Nuevo título del proyecto"
              />
              <button
                type="button"
                onClick={handleGuardarTitulo}
                disabled={modificarTitulo.isPending || !nuevoTitulo.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelarEdicion}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-on-surface"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-on-surface">{ficha.tituloProyecto}</h2>
              <button
                type="button"
                onClick={handleIniciarEdicion}
                className="rounded p-1 text-on-surface-secondary hover:text-primary"
                aria-label="Editar título del proyecto"
              >
                <Edit3 size={14} aria-hidden />
              </button>
            </div>
          )}
        </div>
        {ficha.estadoActual && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {ficha.estadoActual.nombre}
          </span>
        )}
      </div>

      {companeros.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Users size={14} className="text-on-surface-secondary" aria-hidden />
            <p className="text-xs font-medium uppercase tracking-wider text-on-surface-secondary">
              Integrantes
            </p>
          </div>
          <ul className="space-y-0.5 pl-5" aria-label="Integrantes">
            {companeros.map((c) => (
              <li key={c.id} className="text-xs text-on-surface-secondary">
                <span className="font-medium text-on-surface">{c.nombre}</span>
                {' '}— {c.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ficha.asesor && (
        <div className="mt-2 flex items-center gap-2">
          <UserCheck size={14} className="text-on-surface-secondary" aria-hidden />
          <p className="text-xs text-on-surface-secondary">
            Asesor: <span className="font-medium text-on-surface">{ficha.asesor.nombre}</span>
            {' '}— {ficha.asesor.email}
          </p>
        </div>
      )}
    </div>
  );
}
