import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAgregarMapaRuta } from './useAgregarMapaRuta';
import { useProyectosElegibles } from './useProyectosElegibles';
import { campoDeErrorMapaRuta, mensajeErrorMapaRuta } from '../utils/errores-mapa-ruta';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../shared/utils/api-error';
import { fechaIso, opcionRequerida, validarFechaFinPosterior } from '../../../shared/validation';

const schema = z
  .object({
    proyectoGrado: opcionRequerida(),
    fechaInicio: fechaIso(),
    fechaFin: fechaIso(),
  })
  .superRefine(validarFechaFinPosterior);

export type RegistrarMapaRutaValues = z.infer<typeof schema>;

const ETIQUETAS: Record<keyof RegistrarMapaRutaValues, string> = {
  proyectoGrado: 'Proyecto',
  fechaInicio: 'Fecha de inicio',
  fechaFin: 'Fecha de fin',
};

const CAMPOS = Object.keys(ETIQUETAS) as (keyof RegistrarMapaRutaValues)[];

function comoCampo(campo: string): keyof RegistrarMapaRutaValues | undefined {
  return CAMPOS.find((c) => c === campo);
}

interface Opciones {
  onCerrar: () => void;
}

export function useRegistrarMapaRutaForm({ onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<RegistrarMapaRutaValues>({
    resolver: zodResolver(schema),
    defaultValues: { proyectoGrado: '', fechaInicio: '', fechaFin: '' },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;

  const catalogo = useProyectosElegibles();
  const { mutate, isPending, reset: reiniciarMutacion } = useAgregarMapaRuta();

  const catalogoNoDisponible = !catalogo.isLoading && catalogo.proyectos.length === 0;

  const errores = resumenVisible
    ? CAMPOS.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    const destino = comoCampo(campo);
    if (destino) form.setFocus(destino);
  }

  function pintarErroresDelBackend(err: unknown, mensaje: string) {
    let hubo = false;
    for (const fe of getApiFieldErrors(err)) {
      const campo = comoCampo(fe.field);
      if (campo) {
        form.setError(campo, { message: fe.message });
        hubo = true;
      }
    }
    if (hubo) return;
    const campo = campoDeErrorMapaRuta(err);
    if (campo) form.setError(campo, { message: mensaje });
  }

  function registrar(valores: RegistrarMapaRutaValues) {
    setResumenVisible(false);
    mutate(
      {
        proyectoGradoId: valores.proyectoGrado,
        fechaInicio: valores.fechaInicio,
        fechaFin: valores.fechaFin,
      },
      {
        onSuccess: () => {
          toast.success(
            'Mapa de ruta creado',
            'El mapa quedó registrado con sus fechas importantes.',
          );
          onCerrar();
        },
        onError: (err) => {
          const mensaje = mensajeErrorMapaRuta(err);
          toast.error('No se pudo crear el mapa de ruta', mensaje);
          pintarErroresDelBackend(err, mensaje);
          setResumenVisible(true);
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
    catalogo,
    catalogoNoDisponible,
    errores,
    irAlCampo,
  };
}
