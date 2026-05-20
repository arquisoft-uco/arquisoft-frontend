import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { X, UserPlus } from 'lucide-react';
import { useRegistrarFichaPerfil } from '../hooks/useRegistrarFichaPerfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

const MAX_ESTUDIANTES = 3;

const schema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'Máximo 200 caracteres'),
  idAsesorFicha: z.string().min(1, 'Selecciona un asesor'),
  idEstudiantes: z
    .array(z.string())
    .min(1, 'Agrega al menos un estudiante')
    .max(MAX_ESTUDIANTES, `Máximo ${MAX_ESTUDIANTES} estudiantes`),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onCerrar: () => void;
  /** Si se pasa, el campo asesor es de solo lectura (modo asesor).
   *  Si se omite, se muestra un dropdown de selección (modo coordinador). */
  asesorFijoId?: string;
}

export default function RegistrarFichaPerfil({ onCerrar, asesorFijoId }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '',
      idAsesorFicha: asesorFijoId ?? '',
      idEstudiantes: [],
    },
    mode: 'onChange',
  });

  const idEstudiantes = watch('idEstudiantes');

  // Sync fixed asesor into the form when the prop is provided
  useEffect(() => {
    if (asesorFijoId) setValue('idAsesorFicha', asesorFijoId, { shouldValidate: true });
  }, [asesorFijoId, setValue]);

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
    setValue('idEstudiantes', [...idEstudiantes, id], { shouldValidate: true });
  }

  function quitarEstudiante(id: string) {
    setValue(
      'idEstudiantes',
      idEstudiantes.filter((s) => s !== id),
      { shouldValidate: true },
    );
  }

  function handleCancelar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function onSubmit(values: FormValues) {
    mutate(
      { titulo: values.titulo, idAsesorFicha: values.idAsesorFicha, idEstudiantes: values.idEstudiantes },
      {
        onSuccess: () => {
          toast.success('Ficha de perfil registrada', `"${values.titulo}" fue creada correctamente.`);
          reset();
          resetMutation();
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'Error al registrar la ficha',
            getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Título */}
        <div>
          <label htmlFor="fp-titulo" className="mb-1 block text-xs font-medium text-on-surface-secondary">
            Título del Proyecto <span aria-hidden className="text-red-500">*</span>
          </label>
          <input
            id="fp-titulo"
            type="text"
            maxLength={200}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-danger"
            aria-invalid={!!errors.titulo}
            aria-describedby={errors.titulo ? 'fp-titulo-error' : undefined}
            placeholder="Ej. Sistema de Gestión Académica"
            {...register('titulo')}
          />
          {errors.titulo && (
            <p id="fp-titulo-error" className="mt-1 text-xs text-danger" role="alert">
              {errors.titulo.message}
            </p>
          )}
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-danger"
              aria-invalid={!!errors.idAsesorFicha}
              aria-describedby={errors.idAsesorFicha ? 'fp-asesor-error' : undefined}
              {...register('idAsesorFicha')}
            >
              <option value="">Seleccionar asesor...</option>
              {asesores.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} — {a.email}
                </option>
              ))}
            </select>
            {errors.idAsesorFicha && (
              <p id="fp-asesor-error" className="mt-1 text-xs text-danger" role="alert">
                {errors.idAsesorFicha.message}
              </p>
            )}
          </div>
        )}

        {/* Estudiantes */}
        <div>
          <p
            className="mb-1 text-xs font-medium text-on-surface-secondary"
            id="fp-estudiantes-label"
          >
            Estudiantes ({idEstudiantes.length}/{MAX_ESTUDIANTES}){' '}
            <span aria-hidden className="text-red-500">*</span>
          </p>

          {idEstudiantes.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-2" aria-label="Estudiantes seleccionados">
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
            <div className="flex flex-wrap gap-2" aria-labelledby="fp-estudiantes-label">
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

          {errors.idEstudiantes && (
            <p className="mt-1 text-xs text-danger" role="alert">
              {errors.idEstudiantes.message}
            </p>
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
            disabled={isPending || !isValid}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Registrando...' : 'Registrar Ficha'}
          </button>
        </div>
      </form>
    </div>
  );
}
