import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import FormActions from '../../../../shared/components/ui/FormActions';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarEvaluacionesCuantitativasAsesor } from '../../hooks/useRegistrarEvaluacionesCuantitativasAsesor';
import type { CategoriaItemCuantitativoAsesor } from '../../models/CategoriaItemCuantitativoAsesor';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';
import type { ItemCuantitativoAsesor } from '../../models/ItemCuantitativoAsesor';
import type { ParEvaluacionCuantitativaAsesor } from '../../models/ParEvaluacionCuantitativaAsesor';
import { armarElegidos } from '../../utils/elegidos-evaluaciones-cuantitativas';
import { mensajeErrorRegistroEvaluacionesCuantitativasAsesor } from '../../utils/errores-registro-evaluaciones-cuantitativas-asesor';
import { mensajeExitoRegistroEvaluacionesCuantitativas } from '../../utils/errores-registro-evaluaciones-cuantitativas';
import {
  registrarEvaluacionesCuantitativasAsesorSchema,
  type RegistrarEvaluacionesCuantitativasAsesorValues,
} from '../../utils/registrar-evaluaciones-cuantitativas-asesor-schema';
import RegistrarEvaluacionesCuantitativasAsesorCampos from './RegistrarEvaluacionesCuantitativasAsesorCampos';

const ID_FORMULARIO = 'registrar-evaluaciones-cuantitativas-asesor';
const RAIZ = 'overflow-hidden rounded-2xl border border-border bg-surface';
const CUERPO = 'flex flex-col gap-6 p-4 sm:p-6';

interface Props {
  asignacion: EvaluacionAsignadaAsesor;
  rutaListado: string;
  catalogoItems: ItemCuantitativoAsesor[];
  categorias: CategoriaItemCuantitativoAsesor[];
}

export default function RegistrarEvaluacionesCuantitativasAsesorFormulario({
  asignacion,
  rutaListado,
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
  } = useRegistrarEvaluacionesCuantitativasAsesor(asignacion.id);
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrarEvaluacionesCuantitativasAsesorValues>({
    resolver: zodResolver(registrarEvaluacionesCuantitativasAsesorSchema),
    defaultValues: { evaluaciones: [] },
    mode: 'onTouched',
  });

  const pares = watch('evaluaciones');
  const nombresPorId = new Map(catalogoItems.map((item) => [item.id, item.nombre]));
  const nombresCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));
  const itemsPorId = new Map(catalogoItems.map((item) => [item.id, item]));
  const itemsDisponibles = catalogoItems.filter((item) => !pares.some((p) => p.itemId === item.id));
  const elegidos = armarElegidos(pares, itemsPorId, nombresCategoria);
  const mensajeEnvio = isError
    ? mensajeErrorRegistroEvaluacionesCuantitativasAsesor(error, nombresPorId)
    : '';
  const errorLista = errors.evaluaciones?.message ?? errors.evaluaciones?.root?.message;

  function actualizar(nuevaLista: ParEvaluacionCuantitativaAsesor[]) {
    resetMutation();
    setValue('evaluaciones', nuevaLista, { shouldDirty: true, shouldValidate: true });
  }

  function enviar(values: RegistrarEvaluacionesCuantitativasAsesorValues) {
    mutate(values.evaluaciones, {
      onSuccess: () => {
        toast.success(
          'Evaluación registrada',
          mensajeExitoRegistroEvaluacionesCuantitativas(
            values.evaluaciones.length,
            0,
            asignacion.entregable.proyecto,
          ),
        );
        navigate(rutaListado, { replace: true });
      },
      onError: (err) => {
        toast.error(
          'No se pudo registrar la evaluación',
          mensajeErrorRegistroEvaluacionesCuantitativasAsesor(err, nombresPorId),
        );
      },
    });
  }

  function cancelar() {
    if (pares.length > 0) setDescartando(true);
    else navigate(rutaListado);
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
        <RegistrarEvaluacionesCuantitativasAsesorCampos
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
          onConfirmar={() => navigate(rutaListado)}
          onCancelar={() => setDescartando(false)}
        />
      )}
    </div>
  );
}
