import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import type { Item } from '../../models/fichas-perfil';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';

const schema = z.object({
  contenido: textoRequerido(LIMITES.ITEM_CONTENIDO_MAX),
});

type FormValues = z.infer<typeof schema>;

const ID_FORMULARIO = 'editar-item';
const ETIQUETAS = { contenido: 'Contenido' };

interface Props {
  item: Item;
  onCerrar: () => void;
}

export default function EditarItemForm({ item, onCerrar }: Props) {
  const { modificar } = useItemsMiFicha();
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contenido: item.contenido },
    mode: 'onTouched',
  });
  const { register, setError, setFocus, watch } = formulario;
  const { errors, isDirty } = formulario.formState;
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS) : [];

  function cerrar() {
    formulario.reset();
    modificar.reset();
    onCerrar();
  }

  function enviar(values: FormValues) {
    modificar.mutate(
      { itemId: item.id, contenido: values.contenido },
      {
        onSuccess: () => {
          toast.success('Ítem actualizado', 'El contenido se guardó correctamente.');
          cerrar();
        },
        onError: (err) => {
          toast.error(
            'Error al modificar',
            getApiErrorMessage(err, 'No se pudo actualizar el ítem.'),
          );
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'contenido');
          if (delCampo) setError('contenido', { message: delCampo.message });
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo={`Editar ítem ${item.tipoItem.nombre}`}
      sucio={isDirty}
      ocupado={modificar.isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Guardar cambios"
          accionEnviando="Guardando…"
          enviando={modificar.isPending}
          sucio={isDirty}
          sinCambios={!isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        noValidate
        aria-busy={modificar.isPending}
        onSubmit={formulario.handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-5"
      >
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
        <ErrorSummary errores={errores} onIrAlCampo={() => setFocus('contenido')} />
      </form>
    </SidePanel>
  );
}
