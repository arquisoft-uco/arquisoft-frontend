import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import { LIMITES, opcionRequerida, textoRequerido } from '../../../../shared/validation';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import SelectorTipoItem from './SelectorTipoItem';

const schema = z.object({
  tipoItemId: opcionRequerida(),
  contenido: textoRequerido(LIMITES.ITEM_CONTENIDO_MAX),
});

type FormValues = z.infer<typeof schema>;

const ID_FORMULARIO = 'agregar-item';
const ETIQUETAS = { tipoItemId: 'Tipo de ítem', contenido: 'Contenido' };
const CAMPO_POR_FIELD: Record<string, keyof FormValues> = {
  tipoItem: 'tipoItemId',
  contenido: 'contenido',
};
const FORMULARIO = 'flex flex-col gap-5';

interface Props {
  onCerrar: () => void;
}

export default function AgregarItemForm({ onCerrar }: Props) {
  const { fichaId, items, tiposItem, cargandoTipos, errorTipos, agregar } = useItemsMiFicha();
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipoItemId: '', contenido: '' },
    mode: 'onTouched',
  });
  const { register, setError, setFocus, watch } = formulario;
  const { errors, isDirty } = formulario.formState;

  const usados = items.map((i) => i.tipoItem.id);
  const sinCatalogo = !cargandoTipos && (errorTipos || tiposItem.length === 0);
  const todosUsados = !sinCatalogo && tiposItem.every((t) => usados.includes(t.id));
  const sinDisponibles = sinCatalogo || todosUsados;
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS) : [];

  function cerrar() {
    formulario.reset();
    agregar.reset();
    onCerrar();
  }

  function irAlCampo(campo: string) {
    if (campo === 'tipoItemId' || campo === 'contenido') setFocus(campo);
  }

  function enviar(values: FormValues) {
    if (!fichaId) return;
    agregar.mutate(
      { fichaPerfilId: fichaId, tipoItemId: values.tipoItemId, contenido: values.contenido },
      {
        onSuccess: () => {
          toast.success('Ítem agregado', 'El ítem se registró correctamente.');
          cerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, 'No se pudo registrar el ítem.');
          toast.error('Error al agregar', mensaje);
          if (hasApiErrorCode(err, 'ITEM_TIPO_DUPLICADO')) {
            setError('tipoItemId', { message: mensaje });
          }
          getApiFieldErrors(err).forEach(({ field, message }) => {
            const campo = CAMPO_POR_FIELD[field];
            if (campo) setError(campo, { message });
          });
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Agregar ítem"
      descripcion="Elige un tipo y escribe el contenido."
      sucio={isDirty}
      ocupado={agregar.isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Agregar ítem"
          accionEnviando="Agregando…"
          enviando={agregar.isPending}
          sucio={isDirty}
          sinCambios={!fichaId || sinDisponibles}
          nota={sinDisponibles ? 'Sin tipos de ítem disponibles' : undefined}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        noValidate
        aria-busy={agregar.isPending}
        onSubmit={formulario.handleSubmit(enviar, () => setResumenVisible(true))}
        className={FORMULARIO}
      >
        {sinCatalogo && (
          <Notice variante="advertencia">No hay tipos de ítem disponibles por ahora.</Notice>
        )}
        {todosUsados && (
          <Notice variante="advertencia">Tu ficha ya tiene un ítem de cada tipo.</Notice>
        )}
        <SelectorTipoItem
          tipos={tiposItem}
          usados={usados}
          cargando={cargandoTipos}
          error={errors.tipoItemId?.message}
          registro={register('tipoItemId')}
        />
        <Field
          etiqueta="Contenido"
          error={errors.contenido?.message}
          contador={{ actual: watch('contenido').length, max: LIMITES.ITEM_CONTENIDO_MAX }}
        >
          {(control) => (
            <textarea
              rows={6}
              maxLength={LIMITES.ITEM_CONTENIDO_MAX}
              className="field-input"
              {...register('contenido')}
              {...control}
            />
          )}
        </Field>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
