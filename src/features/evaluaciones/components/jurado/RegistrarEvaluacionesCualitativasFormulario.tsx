import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import FormActions from '../../../../shared/components/ui/FormActions';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarEvaluacionesCualitativasJurado } from '../../hooks/useRegistrarEvaluacionesCualitativasJurado';
import type { CriterioItemCualitativoJurado } from '../../models/CriterioItemCualitativoJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';
import type { ItemCualitativoJurado } from '../../models/ItemCualitativoJurado';
import type { ParEvaluacionCualitativaJurado } from '../../models/ParEvaluacionCualitativaJurado';
import { mensajeErrorRegistroEvaluacionesCualitativas } from '../../utils/errores-registro-evaluaciones-cualitativas';
import {
  registrarEvaluacionesCualitativasJuradoSchema,
  type RegistrarEvaluacionesCualitativasJuradoValues,
} from '../../utils/registrar-evaluaciones-cualitativas-jurado-schema';
import RegistrarEvaluacionesCualitativasCampos from './RegistrarEvaluacionesCualitativasCampos';

const ID_FORMULARIO = 'registrar-evaluaciones-cualitativas-jurado';
const RAIZ = 'overflow-hidden rounded-2xl border border-border bg-surface';
const CUERPO = 'flex flex-col gap-6 p-4 sm:p-6';

interface Props {
  asignacion: EvaluacionAsignadaJurado;
  catalogoItems: ItemCualitativoJurado[];
  catalogoCriterios: CriterioItemCualitativoJurado[];
}

export default function RegistrarEvaluacionesCualitativasFormulario({
  asignacion,
  catalogoItems,
  catalogoCriterios,
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
  } = useRegistrarEvaluacionesCualitativasJurado(asignacion.id);
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrarEvaluacionesCualitativasJuradoValues>({
    resolver: zodResolver(registrarEvaluacionesCualitativasJuradoSchema),
    defaultValues: { evaluaciones: [] },
    mode: 'onTouched',
  });

  const pares = watch('evaluaciones');
  const nombresPorId = new Map(catalogoItems.map((item) => [item.id, item.nombre]));
  const nombresCriterios = new Map(catalogoCriterios.map((c) => [c.id, c.nombre]));
  const itemsDisponibles = catalogoItems.filter((item) => !pares.some((p) => p.itemId === item.id));
  const elegidos = pares.map(({ itemId, criterioId }) => ({
    id: itemId,
    etiqueta: nombresPorId.get(itemId) ?? itemId,
    descripcion: `Criterio: ${nombresCriterios.get(criterioId) ?? criterioId}`,
  }));
  const mensajeEnvio = isError
    ? mensajeErrorRegistroEvaluacionesCualitativas(error, nombresPorId)
    : '';
  const errorLista = errors.evaluaciones?.message ?? errors.evaluaciones?.root?.message;

  function actualizar(nuevaLista: ParEvaluacionCualitativaJurado[]) {
    resetMutation();
    setValue('evaluaciones', nuevaLista, { shouldDirty: true, shouldValidate: true });
  }

  function enviar(values: RegistrarEvaluacionesCualitativasJuradoValues) {
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
          mensajeErrorRegistroEvaluacionesCualitativas(err, nombresPorId),
        );
      },
    });
  }

  function cancelar() {
    if (pares.length > 0) setDescartando(true);
    else navigate('/evaluaciones');
  }

  const sinCatalogo = catalogoItems.length === 0 || catalogoCriterios.length === 0;

  return (
    <div className={RAIZ}>
      <form
        id={ID_FORMULARIO}
        aria-label="Registro de evaluación cualitativa"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => inputItemRef.current?.focus())}
        className={CUERPO}
      >
        <RegistrarEvaluacionesCualitativasCampos
          items={itemsDisponibles}
          criterios={catalogoCriterios}
          totalItems={catalogoItems.length}
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
        sinCambios={pares.length === 0 || sinCatalogo}
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
