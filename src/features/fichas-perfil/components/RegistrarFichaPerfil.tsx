import { useState, type SyntheticEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, UserPlus } from 'lucide-react';
import { useRegistrarFichaPerfil } from '../hooks/useRegistrarFichaPerfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { toast } from '../../../shared/hooks/useToast';

const MAX_ESTUDIANTES = 3;

interface Props {
  onCerrar: () => void;
  /** Si se pasa, el campo asesor es de solo lectura (modo asesor).
   *  Si se omite, se muestra un dropdown de selección (modo coordinador). */
  asesorFijoId?: string;
}

export default function RegistrarFichaPerfil({ onCerrar, asesorFijoId }: Props) {
  const [titulo, setTitulo] = useState('');
  const [idAsesorFicha, setIdAsesorFicha] = useState(asesorFijoId ?? '');
  const [idEstudiantes, setIdEstudiantes] = useState<string[]>([]);

  const { data: asesores = [] } = useQuery({
    queryKey: ['asesores-disponibles'],
    queryFn: fichasPerfilService.consultarAsesoresDisponibles,
  });

  const { data: estudiantes = [] } = useQuery({
    queryKey: ['estudiantes-disponibles'],
    queryFn: fichasPerfilService.consultarEstudiantesDisponibles,
  });

  const { mutate, isPending, reset: resetMutation } = useRegistrarFichaPerfil();

  const estudiantesDisponiblesParaAgregar = estudiantes.filter(
    (e) => !idEstudiantes.includes(e.id),
  );

  const asesorFijoNombre = asesorFijoId
    ? (asesores.find((a) => a.id === asesorFijoId)?.nombre ?? 'Cargando...')
    : undefined;

  function agregarEstudiante(id: string) {
    if (idEstudiantes.length >= MAX_ESTUDIANTES) return;
    setIdEstudiantes((prev) => [...prev, id]);
  }

  function quitarEstudiante(id: string) {
    setIdEstudiantes((prev) => prev.filter((s) => s !== id));
  }

  function resetForm() {
    setTitulo('');
    if (!asesorFijoId) setIdAsesorFicha('');
    setIdEstudiantes([]);
    resetMutation();
  }

  function handleCancelar() {
    resetForm();
    onCerrar();
  }

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!titulo.trim() || !idAsesorFicha || idEstudiantes.length === 0) return;
    mutate(
      { titulo: titulo.trim(), idAsesorFicha, idEstudiantes },
      {
        onSuccess: () => {
          toast.success('Ficha de perfil registrada', `"${titulo.trim()}" fue creada correctamente.`);
          resetForm();
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'Error al registrar la ficha',
            err instanceof Error ? err.message : 'Verifica los datos e inténtalo nuevamente.',
          );
        },
      },
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-on-surface">
        Registrar nueva Ficha de Perfil
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Título */}
        <div>
          <label htmlFor="fp-titulo" className="mb-1 block text-xs font-medium text-on-surface-secondary">
            Título del Proyecto <span aria-hidden className="text-red-500">*</span>
          </label>
          <input
            id="fp-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={200}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej. Sistema de Gestión Académica"
          />
        </div>

        {/* Asesor: dropdown (coordinador) o solo lectura (asesor) */}
        {asesorFijoId ? (
          <div>
            <p className="mb-1 text-xs font-medium text-on-surface-secondary">Asesor de Ficha</p>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-on-surface-secondary">
              {asesorFijoNombre}
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="fp-asesor" className="mb-1 block text-xs font-medium text-on-surface-secondary">
              Asesor de Ficha <span aria-hidden className="text-red-500">*</span>
            </label>
            <select
              id="fp-asesor"
              value={idAsesorFicha}
              onChange={(e) => setIdAsesorFicha(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar asesor...</option>
              {asesores.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} — {a.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Estudiantes */}
        <div>
          <p className="mb-1 text-xs font-medium text-on-surface-secondary">
            Estudiantes ({idEstudiantes.length}/{MAX_ESTUDIANTES}){' '}
            <span aria-hidden className="text-red-500">*</span>
          </p>
          {idEstudiantes.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-2">
              {idEstudiantes.map((id) => {
                const est = estudiantes.find((e) => e.id === id);
                return (
                  <li key={id} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-on-surface">
                    {est?.nombre ?? id}
                    <button
                      type="button"
                      onClick={() => quitarEstudiante(id)}
                      aria-label={`Quitar a ${est?.nombre}`}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X size={12} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {idEstudiantes.length < MAX_ESTUDIANTES && estudiantesDisponiblesParaAgregar.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {estudiantesDisponiblesParaAgregar.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => agregarEstudiante(e.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-on-surface transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <UserPlus size={12} aria-hidden />
                  {e.nombre}
                </button>
              ))}
            </div>
          )}

          {idEstudiantes.length === MAX_ESTUDIANTES && (
            <p className="text-xs text-on-surface-secondary">Máximo de estudiantes alcanzado.</p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleCancelar}
            className="rounded-lg border border-border px-4 py-2 text-sm text-on-surface transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !titulo.trim() || !idAsesorFicha || idEstudiantes.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Registrando...' : 'Registrar Ficha'}
          </button>
        </div>
      </form>
    </div>
  );
}
