import type { UseFormReturn } from 'react-hook-form';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import SelectorArchivo from '../../../../shared/components/ui/SelectorArchivo';
import { LIMITES } from '../../../../shared/validation';
import { ACEPTA_VERSION } from '../../utils/tipos-archivo-version';
import { ETIQUETAS_CAMPO_VERSION, type VersionValues } from '../../utils/version-schema';

const NOMBRE_OPCIONES = 'modo-subida-version';
const OPCIONES = 'flex flex-col gap-2';

interface Props {
  form: UseFormReturn<VersionValues>;
  documentosExistentes: string[];
  cargandoDocumentos: boolean;
  enviando: boolean;
  onElegirArchivo: (archivo: File | null) => void;
  onCambiarModo: (modo: VersionValues['modo']) => void;
}

function ayudaDeExistente(cargando: boolean, hayDocumentos: boolean): string | undefined {
  if (cargando) return 'Cargando documentos…';
  if (!hayDocumentos) return 'Este repositorio aún no tiene documentos';
  return undefined;
}

export default function SubirVersionCampos({
  form,
  documentosExistentes,
  cargandoDocumentos,
  enviando,
  onElegirArchivo,
  onCambiarModo,
}: Props) {
  const { register, watch, setValue, formState } = form;
  const { errors } = formState;
  const modo = watch('modo');
  const nombreDocumento = watch('nombreDocumento') ?? '';
  const archivo = watch('archivo');
  const hayDocumentos = documentosExistentes.length > 0;
  const sinExistentes = cargandoDocumentos || !hayDocumentos;

  return (
    <>
      <FormSection titulo="Documento">
        <div className={OPCIONES}>
          <OpcionRadio
            nombre={NOMBRE_OPCIONES}
            valor="nuevo"
            titulo="Documento nuevo"
            elegida={modo === 'nuevo'}
            deshabilitada={enviando}
            onElegir={() => onCambiarModo('nuevo')}
          />
          <OpcionRadio
            nombre={NOMBRE_OPCIONES}
            valor="existente"
            titulo="Nueva versión de un documento existente"
            descripcion={ayudaDeExistente(cargandoDocumentos, hayDocumentos)}
            elegida={modo === 'existente'}
            deshabilitada={enviando || sinExistentes}
            onElegir={() => onCambiarModo('existente')}
          />
        </div>
        <Field
          etiqueta={ETIQUETAS_CAMPO_VERSION.nombreDocumento}
          error={errors.nombreDocumento?.message}
          contador={
            modo === 'nuevo'
              ? { actual: nombreDocumento.length, max: LIMITES.VERSION_NOMBRE_DOCUMENTO_MAX }
              : undefined
          }
        >
          {(control) =>
            modo === 'nuevo' ? (
              <input
                className="field-input"
                maxLength={LIMITES.VERSION_NOMBRE_DOCUMENTO_MAX}
                disabled={enviando}
                {...control}
                {...register('nombreDocumento')}
              />
            ) : (
              <Combobox
                {...control}
                opciones={documentosExistentes.map((nombre) => ({ id: nombre, etiqueta: nombre }))}
                valor={nombreDocumento}
                onCambiar={(nombre) =>
                  setValue('nombreDocumento', nombre, { shouldValidate: true, shouldDirty: true })
                }
                textoVacio="No hay documentos con ese nombre."
                etiquetaElegidos="Documento elegido"
                placeholder="Busca un documento"
                deshabilitado={enviando}
              />
            )
          }
        </Field>
      </FormSection>
      <FormSection titulo="Archivo">
        <Field
          etiqueta={ETIQUETAS_CAMPO_VERSION.archivo}
          ayuda="PDF, DOCX, XLSX o PPTX. Máximo 5 MB."
          error={errors.archivo?.message}
        >
          {(control) => (
            <SelectorArchivo
              control={control}
              archivo={archivo}
              onElegir={onElegirArchivo}
              acepta={ACEPTA_VERSION}
              deshabilitado={enviando}
            />
          )}
        </Field>
      </FormSection>
    </>
  );
}
