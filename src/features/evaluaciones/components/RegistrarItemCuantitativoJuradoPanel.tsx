import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorSummary, { resumirErrores } from '../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../shared/components/ui/FormActions';
import Notice from '../../../shared/components/ui/Notice';
import SidePanel from '../../../shared/components/ui/SidePanel';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import { useCategoriasItemCuantitativoJurado } from '../hooks/useCategoriasItemCuantitativoJurado';
import { useRegistrarItemCuantitativoJurado } from '../hooks/useRegistrarItemCuantitativoJurado';
import {
  registrarItemCuantitativoJuradoSchema,
  type RegistrarItemCuantitativoJuradoValues,
} from '../utils/registrar-item-cuantitativo-jurado-schema';
import RegistrarItemCuantitativoJuradoCampos, {
  ETIQUETAS_CAMPO,
} from './RegistrarItemCuantitativoJuradoCampos';

const ID_FORMULARIO = 'registrar-item-cuantitativo-jurado';
const CAMPOS = ['nombre', 'descripcion', 'categoriaId', 'valor'] as const;
const CODIGO_NOMBRE_DUPLICADO = 'ITEM_CUANTITATIVO_JURADO_NOMBRE_CATEGORIA_DUPLICADO';
const CODIGO_CATEGORIA_NO_ENCONTRADA = 'ITEM_CUANTITATIVO_JURADO_CATEGORIA_NO_ENCONTRADA';

function campoDelFormulario(campoBackend: string) {
  const campo = campoBackend === 'categoria' ? 'categoriaId' : campoBackend;
  return CAMPOS.find((c) => c === campo);
}

interface Props {
  onCerrar: () => void;
}

export default function RegistrarItemCuantitativoJuradoPanel({ onCerrar }: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isDirty },
  } = useForm<RegistrarItemCuantitativoJuradoValues>({
    resolver: zodResolver(registrarItemCuantitativoJuradoSchema),
    defaultValues: { nombre: '', descripcion: '', categoriaId: '', valor: '' },
    mode: 'onTouched',
  });

  const categorias = useCategoriasItemCuantitativoJurado();
  const { mutate, isPending, reset: resetMutation } = useRegistrarItemCuantitativoJurado();
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];
  const listaCategorias = categorias.data ?? [];
  const sinCategorias = categorias.isSuccess && listaCategorias.length === 0;

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function irAlCampo(campo: string) {
    const destino = campoDelFormulario(campo);
    if (destino) setFocus(destino);
  }

  function enviar(values: RegistrarItemCuantitativoJuradoValues) {
    mutate(
      { ...values, valor: Number(values.valor) },
      {
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
          if (hasApiErrorCode(err, CODIGO_CATEGORIA_NO_ENCONTRADA)) {
            setError('categoriaId', { message: mensaje });
          }
          getApiFieldErrors(err).forEach((fe) => {
            const campo = campoDelFormulario(fe.field);
            if (campo) setError(campo, { message: fe.message });
          });
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Registrar ítem"
      descripcion="Define un valor máximo con el que el jurado puntúa un proyecto."
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
        aria-label="Registro de ítem cuantitativo"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-6"
      >
        {categorias.isError && (
          <Notice
            variante="advertencia"
            titulo="No se pudieron cargar las categorías"
            accion={{ etiqueta: 'Reintentar', onClick: () => void categorias.refetch() }}
          >
            Sin categoría no es posible registrar el ítem.
          </Notice>
        )}
        {sinCategorias && (
          <Notice variante="info">
            Aún no hay categorías registradas. Se necesita al menos una para registrar un ítem.
          </Notice>
        )}
        <RegistrarItemCuantitativoJuradoCampos
          register={register}
          errors={errors}
          controlFormulario={control}
          categorias={listaCategorias}
          cargandoCategorias={categorias.isLoading}
        />
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
