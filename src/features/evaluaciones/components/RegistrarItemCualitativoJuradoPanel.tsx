import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorSummary, { resumirErrores } from '../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../shared/components/ui/FormActions';
import SidePanel from '../../../shared/components/ui/SidePanel';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../shared/validation';
import { useRegistrarItemCualitativoJurado } from '../hooks/useRegistrarItemCualitativoJurado';
import RegistrarItemCualitativoJuradoCampos, {
  ETIQUETAS_CAMPO,
} from './RegistrarItemCualitativoJuradoCampos';

const ID_FORMULARIO = 'registrar-item-cualitativo-jurado';

const schema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onCerrar: () => void;
}

export default function RegistrarItemCualitativoJuradoPanel({ onCerrar }: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', descripcion: '' },
    mode: 'onTouched',
  });

  const { mutate, isPending, reset: resetMutation } = useRegistrarItemCualitativoJurado();
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function irAlCampo(campo: string) {
    if (campo === 'nombre' || campo === 'descripcion') setFocus(campo);
  }

  function enviar(values: FormValues) {
    mutate(values, {
      onSuccess: () => {
        toast.success('Ítem registrado', `"${values.nombre}" fue registrado correctamente.`);
        cerrar();
      },
      onError: (err) => {
        const mensaje = getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
        toast.error('No se pudo registrar el ítem', mensaje);

        if (hasApiErrorCode(err, 'ITEM_CUALITATIVO_JURADO_NOMBRE_DUPLICADO')) {
          setError('nombre', { message: mensaje });
        }
        getApiFieldErrors(err).forEach((fe) => {
          if (fe.field === 'nombre' || fe.field === 'descripcion') {
            setError(fe.field, { message: fe.message });
          }
        });
        setResumenVisible(true);
      },
    });
  }

  return (
    <SidePanel
      titulo="Registrar ítem"
      descripcion="Define un criterio cualitativo para que el jurado evalúe."
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Registrar ítem"
          accionEnviando="Registrando…"
          enviando={isPending}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Registro de ítem cualitativo"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-6"
      >
        <RegistrarItemCualitativoJuradoCampos
          register={register}
          errors={errors}
          longitudes={{
            nombre: (watch('nombre') ?? '').length,
            descripcion: (watch('descripcion') ?? '').length,
          }}
        />
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
