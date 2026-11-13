import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '../../../../shared/hooks/useToast';
import {
  useRegistrarEvaluacionCuantitativaConObservaciones,
  type ResultadoRegistroConObservaciones,
} from '../../hooks/useRegistrarEvaluacionCuantitativaConObservaciones';
import type { CategoriaItemCuantitativoJurado } from '../../models/CategoriaItemCuantitativoJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';
import type { ItemCuantitativoJurado } from '../../models/ItemCuantitativoJurado';
import type { ParEvaluacionCuantitativaJurado } from '../../models/ParEvaluacionCuantitativaJurado';
import { armarElegidos } from '../../utils/elegidos-evaluaciones-cuantitativas';
import {
  mensajeErrorRegistroEvaluacionesCuantitativas,
  mensajeExitoRegistroEvaluacionesCuantitativas,
  mensajeObservacionesFaltantes,
} from '../../utils/errores-registro-evaluaciones-cuantitativas';
import {
  registrarEvaluacionesCuantitativasJuradoSchema,
  type RegistrarEvaluacionesCuantitativasJuradoValues,
} from '../../utils/registrar-evaluaciones-cuantitativas-jurado-schema';
import RegistrarEvaluacionesCuantitativasAcciones from './RegistrarEvaluacionesCuantitativasAcciones';
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
  const registro = useRegistrarEvaluacionCuantitativaConObservaciones(asignacion.id);
  const { pendientes, enviando } = registro;
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
  const elegidos = armarElegidos(pares, itemsPorId, nombresCategoria);
  const mensajeEnvio = registro.isError
    ? mensajeErrorRegistroEvaluacionesCuantitativas(registro.error, nombresPorId)
    : '';
  const errorLista = errors.evaluaciones?.message ?? errors.evaluaciones?.root?.message;

  function actualizar(nuevaLista: ParEvaluacionCuantitativaJurado[]) {
    registro.reiniciarError();
    setValue('evaluaciones', nuevaLista, { shouldDirty: true, shouldValidate: true });
  }

  function terminar({
    total,
    totalObservaciones,
    pendientes: faltan,
  }: ResultadoRegistroConObservaciones) {
    if (faltan.length > 0) {
      toast.error('Faltan observaciones', mensajeObservacionesFaltantes(faltan.length));
      return;
    }
    toast.success(
      'Evaluación registrada',
      mensajeExitoRegistroEvaluacionesCuantitativas(
        total,
        totalObservaciones,
        asignacion.entregable.proyecto,
      ),
    );
    navigate('/evaluaciones', { replace: true });
  }

  function enviar(values: RegistrarEvaluacionesCuantitativasJuradoValues) {
    registro.registrar(values.evaluaciones, {
      onSuccess: terminar,
      onError: (err) => {
        toast.error(
          'No se pudo registrar la evaluación',
          mensajeErrorRegistroEvaluacionesCuantitativas(err, nombresPorId),
        );
      },
    });
  }

  return (
    <div className={RAIZ}>
      <form
        id={ID_FORMULARIO}
        aria-label="Registro de evaluación cuantitativa"
        noValidate
        aria-busy={enviando}
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
          enviando={enviando}
          inputItemRef={inputItemRef}
          onAgregar={(par) => actualizar([...pares, par])}
          onQuitar={(id) => actualizar(pares.filter((p) => p.itemId !== id))}
          pendientes={pendientes}
          nombresPorId={nombresPorId}
          reintentando={registro.reintentando}
          onReintentar={() => void registro.reintentar({ onSuccess: terminar })}
          onSalir={() => navigate('/evaluaciones', { replace: true })}
        />
      </form>
      {pendientes.length === 0 && (
        <RegistrarEvaluacionesCuantitativasAcciones
          formId={ID_FORMULARIO}
          totalPares={pares.length}
          enviando={enviando}
        />
      )}
    </div>
  );
}
