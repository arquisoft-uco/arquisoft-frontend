import { useState } from 'react';
import { Edit3, UserCheck } from 'lucide-react';
import { useMiFichaPerfil } from '../../hooks/useMiFichaPerfil';
import CompanerosFichaPanel from './CompanerosFichaPanel';
import EditarTituloForm from './EditarTituloForm';

export default function MiFichaHeader() {
  const { ficha } = useMiFichaPerfil();

  const [editandoTitulo, setEditandoTitulo] = useState(false);

  if (!ficha) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-on-surface-secondary">
            Mi Ficha de Perfil
          </p>
          {editandoTitulo ? (
            <EditarTituloForm
              tituloActual={ficha.tituloProyecto}
              onCerrar={() => setEditandoTitulo(false)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-on-surface">{ficha.tituloProyecto}</h2>
              <button
                type="button"
                onClick={() => setEditandoTitulo(true)}
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

      <CompanerosFichaPanel idFichaPerfil={ficha.id} />

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
