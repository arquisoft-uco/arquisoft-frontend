import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistrarFichaPerfil } from './useRegistrarFichaPerfil';
import { toast } from '../../../shared/hooks/useToast';
import { useAsesoresFichaVigentes } from '../../../shared/hooks/useAsesoresFichaVigentes';
import { useEstudiantesVigentes } from '../../../shared/hooks/useEstudiantesVigentes';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  LIMITES,
  textoRequerido,
  opcionRequerida,
  listaConMaximo,
  MENSAJES_VALIDACION,
} from '../../../shared/validation';

const schema = z.object({
  titulo: textoRequerido(LIMITES.TITULO_PROYECTO_MAX),
  idAsesorFicha: opcionRequerida(),
  idEstudiantes: listaConMaximo(LIMITES.ESTUDIANTES_MAX).min(1, MENSAJES_VALIDACION.listaVacia),
});

export type NuevaFichaValues = z.infer<typeof schema>;

const ETIQUETAS: Record<keyof NuevaFichaValues, string> = {
  titulo: 'Título del proyecto',
  idAsesorFicha: 'Asesor',
  idEstudiantes: 'Estudiantes',
};

const CAMPOS = Object.keys(ETIQUETAS) as (keyof NuevaFichaValues)[];

const MENSAJE_ERROR_POR_DEFECTO = 'Verifica los datos e inténtalo nuevamente.';

interface Opciones {
  onCerrar: () => void;
}

export function useNuevaFichaForm({ onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<NuevaFichaValues>({
    resolver: zodResolver(schema),
    defaultValues: { titulo: '', idAsesorFicha: '', idEstudiantes: [] },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;

  const asesores = useAsesoresFichaVigentes();
  const estudiantes = useEstudiantesVigentes();
  const { mutate, isPending, reset: reiniciarMutacion } = useRegistrarFichaPerfil();

  const catalogoNoDisponible = asesores.isError || estudiantes.isError;

  const errores = resumenVisible
    ? CAMPOS.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function registrar(valores: NuevaFichaValues) {
    setResumenVisible(false);
    mutate(
      {
        tituloProyecto: valores.titulo,
        asesorFichaId: valores.idAsesorFicha,
        estudiantesIds: valores.idEstudiantes,
      },
      {
        onSuccess: () => {
          toast.success(
            'Ficha de perfil registrada',
            `"${valores.titulo}" fue creada correctamente.`,
          );
          onCerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, MENSAJE_ERROR_POR_DEFECTO);
          toast.error('Error al registrar la ficha', mensaje);
          if (hasApiErrorCode(err, 'FICHA_TITULO_DUPLICADO')) {
            form.setError('titulo', { message: mensaje });
          }
        },
      },
    );
  }

  function cerrar() {
    form.reset();
    reiniciarMutacion();
    onCerrar();
  }

  const enviar = form.handleSubmit(registrar, () => setResumenVisible(true));

  return {
    form,
    enviar,
    enviando: isPending,
    cerrar,
    isDirty,
    catalogos: { asesores, estudiantes },
    catalogoNoDisponible,
    errores,
    irAlCampo,
  };
}
