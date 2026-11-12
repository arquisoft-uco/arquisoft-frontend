import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import FormActions from '../../../../shared/components/ui/FormActions';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarEvaluacionesCuantitativasJurado } from '../../hooks/useRegistrarEvaluacionesCuantitativasJurado';
import type { CategoriaItemCuantitativoJurado } from '../../models/CategoriaItemCuantitativoJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';
import type { ItemCuantitativoJurado } from '../../models/ItemCuantitativoJurado';
import type { ParEvaluacionCuantitativaJurado } from '../../models/ParEvaluacionCuantitativaJurado';
import { mensajeErrorRegistroEvaluacionesCuantitativas } from '../../utils/errores-registro-evaluaciones-cuantitativas';
import {
  registrarEvaluacionesCuantitativasJuradoSchema,
  type RegistrarEvaluacionesCuantitativasJuradoValues,
} from '../../utils/registrar-evaluaciones-cuantitativas-jurado-schema';
import RegistrarEvaluacionesCuantitativasCampos from './RegistrarEvaluacionesCuantitativasCampos';

const ID_FORMULARIO = 'registrar-evaluaciones-cuantitativas-jurado';
const RAIZ = 'overflow-hidden rounded-2xl border border-border bg-surface';
const CUERPO = 'flex flex-col gap-6 p-4 sm:p-6';

interface Props {
  asignacion: EvaluacionAsignadaJurado;
  catalogoItems: ItemCuantitativoJurado[];
  categorias: CategoriaItemCuantitativoJurado[];
}

export default function RegistrarEvaluacionesCuantitativasFormulario({
  asignacion,
  catalogoItems,
  categorias,
}: Props) {
  const navigate = useNavigate();
  const inputItemRef = useRef<HTMLInputElement | null>(null);
  const [descartando, setDescartando] = useState(false);
  const {
    mutate,
    isPending,
    isError,
    error,
    reset: resetMutation,
  } = useRegistrarEvaluacionesCuantitativasJurado(asignacion.id);
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrarEvaluacionesCuantitativasJuradoValues>({
    resolver: zodResolver(registrarEvaluacionesCuantitativasJuradoSchema),
    defaultValues: { evaluaciones: [] },
    mode: 'onTouched',
  });

  const pares = watch('evaluaciones');
  const nombresPorId = new Map(catalogoItems.map((item) => [item.id, item.nombre]));
  const nombresCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));
  const itemsPorId = new Map(catalogoItems.map((item) => [item.id, item]));
  const itemsDisponibles = catalogoItems.filter((item) => !pares.some((p) => p.itemId === item.id));
  const elegidos = pares.map(({ itemId, puntaje }) => {
    const item = itemsPorId.get(itemId);
    const categoria = item ? (nombresCategoria.get(item.categoriaId) ?? 'Sin categoría') : '';
    return {
      id: itemId,
      etiqueta: item?.nombre ?? itemId,
      descripcion: `${categoria} · puntaje ${puntaje} de ${item?.valor ?? '—'}`,
    };
  });
  const mensajeEnvio = isError
    ? mensajeErrorRegistroEvaluacionesCuantitativas(error, nombresPorId)
    : '';
  const errorLista = errors.evaluaciones?.message ?? errors.evaluaciones?.root?.message;

  function actualizar(nuevaLista: ParEvaluacionCuantitativaJurado[]) {
    resetMutation();
    setValue('evaluaciones', nuevaLista, { shouldDirty: true, shouldValidate: true });
  }

  function enviar(values: RegistrarEvaluacionesCuantitativasJuradoValues) {
    mutate(values.evaluaciones, {
      onSuccess: () => {
        const total = values.evaluaciones.length;
        toast.success(
          'Evaluación registrada',
          `Se registraron ${total} ${total === 1 ? 'valoración' : 'valoraciones'} de ${asignacion.entregable.proyecto}.`,
        );
        navigate('/evaluaciones', { replace: true });
      },
      onError: (err) => {
        toast.error(
          'No se pudo registrar la evaluación',
          mensajeErrorRegistroEvaluacionesCuantitativas(err, nombresPorId),
        );
      },
    });
  }

  function cancelar() {
    if (pares.length > 0) setDescartando(true);
    else navigate('/evaluaciones');
  }

  return (
    <div className={RAIZ}>
      <form
        id={ID_FORMULARIO}
        aria-label="Registro de evaluación cuantitativa"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => inputItemRef.current?.focus())}
        className={CUERPO}
      >
        <RegistrarEvaluacionesCuantitativasCampos
          items={itemsDisponibles}
          nombresCategoria={nombresCategoria}
          totalPares={pares.length}
          elegidos={elegidos}
          errorLista={errorLista}
          mensajeEnvio={mensajeEnvio}
          enviando={isPending}
          inputItemRef={inputItemRef}
          onAgregar={(par) => actualizar([...pares, par])}
          onQuitar={(id) => actualizar(pares.filter((p) => p.itemId !== id))}
        />
      </form>
      <FormActions
        accion="Registrar evaluación"
        accionEnviando="Registrando…"
        formId={ID_FORMULARIO}
        sucio={pares.length > 0}
        sinCambios={pares.length === 0}
        enviando={isPending}
        onCancelar={cancelar}
      />
      {descartando && (
        <ConfirmDialog
          titulo="¿Descartar la evaluación?"
          descripcion="Se perderán las valoraciones que agregaste."
          variante="advertencia"
          labelConfirmar="Descartar"
          labelCancelar="Seguir editando"
          onConfirmar={() => navigate('/evaluaciones')}
          onCancelar={() => setDescartando(false)}
        />
      )}
    </div>
  );
}
