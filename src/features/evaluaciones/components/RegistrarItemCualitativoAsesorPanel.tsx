import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorSummary, { resumirErrores } from '../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../shared/components/ui/FormActions';
import SidePanel from '../../../shared/components/ui/SidePanel';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import { useRegistrarItemCualitativoAsesor } from '../hooks/useRegistrarItemCualitativoAsesor';
import {
  registrarItemCualitativoAsesorSchema,
  type RegistrarItemCualitativoAsesorValues,
} from '../utils/registrar-item-cualitativo-asesor-schema';
import RegistrarItemCualitativoAsesorCampos, {
  ETIQUETAS_CAMPO,
} from './RegistrarItemCualitativoAsesorCampos';

const ID_FORMULARIO = 'registrar-item-cualitativo-asesor';
const CODIGO_NOMBRE_DUPLICADO = 'ITEM_CUALITATIVO_ASESOR_NOMBRE_DUPLICADO';
const CAMPOS = ['nombre', 'descripcion'] as const;

interface Props {
  onCerrar: () => void;
}

export default function RegistrarItemCualitativoAsesorPanel({ onCerrar }: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isDirty },
  } = useForm<RegistrarItemCualitativoAsesorValues>({
    resolver: zodResolver(registrarItemCualitativoAsesorSchema),
    defaultValues: { nombre: '', descripcion: '' },
    mode: 'onTouched',
  });

  const { mutate, isPending, reset: resetMutation } = useRegistrarItemCualitativoAsesor();
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) setFocus(destino);
  }

  function enviar(values: RegistrarItemCualitativoAsesorValues) {
    mutate(values, {
      onSuccess: () => {
        toast.success('Ítem registrado', `"${values.nombre}" fue registrado correctamente.`);
        cerrar();
      },
      onError: (err) => {
        const mensaje = getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
        toast.error('No se pudo registrar el ítem', mensaje);

        if (hasApiErrorCode(err, CODIGO_NOMBRE_DUPLICADO)) {
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
      descripcion="Define un criterio cualitativo para que el asesor evalúe."
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
        aria-label="Registro de ítem cualitativo del asesor"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-6"
      >
        <RegistrarItemCualitativoAsesorCampos
          register={register}
          errors={errors}
          controlFormulario={control}
        />
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
