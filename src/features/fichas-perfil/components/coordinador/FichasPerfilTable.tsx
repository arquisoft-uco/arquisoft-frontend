import { useState, Fragment } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { FichaPerfil } from '../../models/FichaPerfil';
import EstudiantesVinculadosPanel from './EstudiantesVinculadosPanel';
import CambiarAsesorForm from './CambiarAsesorForm';

interface Props {
  fichas: FichaPerfil[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function FichasPerfilTable({
  fichas,
  totalElements,
  totalPages,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const [fichaExpandida, setFichaExpandida] = useState<string | null>(null);
  const [fichaAsesorExpandida, setFichaAsesorExpandida] = useState<string | null>(null);

  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(page * pageSize + fichas.length, totalElements);

  function toggleExpandir(id: string) {
    setFichaExpandida((prev) => (prev === id ? null : id));
  }

  function toggleAsesor(id: string) {
    setFichaAsesorExpandida((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Fichas de perfil del coordinador">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Título del Proyecto</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Asesor</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Correo del Asesor</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Estudiantes</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fichas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-on-surface-secondary">
                  No hay fichas de perfil registradas.
                </td>
              </tr>
            ) : (
              fichas.map((ficha) => {
                const expandida = fichaExpandida === ficha.id;
                const asesorExpandida = fichaAsesorExpandida === ficha.id;
                return (
                  <Fragment key={ficha.id}>
                    <tr className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-on-surface">{ficha.titulo}</td>
                      <td className="px-4 py-3 text-on-surface">{ficha.asesor.nombre}</td>
                      <td className="px-4 py-3 text-on-surface-secondary">{ficha.asesor.email}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleExpandir(ficha.id)}
                          aria-expanded={expandida}
                          aria-label={expandida ? 'Ocultar estudiantes' : 'Ver estudiantes vinculados'}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-on-surface transition-colors hover:bg-muted"
                        >
                          {expandida ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
                          Estudiantes
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleAsesor(ficha.id)}
                          aria-expanded={asesorExpandida}
                          aria-label={asesorExpandida ? 'Ocultar formulario de cambio de asesor' : 'Cambiar asesor'}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-on-surface transition-colors hover:bg-muted"
                        >
                          {asesorExpandida ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
                          Cambiar Asesor
                        </button>
                      </td>
                    </tr>
                    {expandida && (
                      <tr className="bg-surface-secondary">
                        <td colSpan={5} className="p-0">
                          <EstudiantesVinculadosPanel idFichaPerfil={ficha.id} />
                        </td>
                      </tr>
                    )}
                    {asesorExpandida && (
                      <tr className="bg-surface-secondary">
                        <td colSpan={5} className="p-0">
                          <CambiarAsesorForm
                            idFichaPerfil={ficha.id}
                            idAsesorActual={ficha.asesor.id}
                            onExito={() => setFichaAsesorExpandida(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-on-surface-secondary">
            {from}–{to} de {totalElements} fichas
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              aria-label="Página anterior"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} aria-hidden />
              Anterior
            </button>
            <span className="px-3 py-1.5 text-xs text-on-surface-secondary">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label="Página siguiente"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <ChevronRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
