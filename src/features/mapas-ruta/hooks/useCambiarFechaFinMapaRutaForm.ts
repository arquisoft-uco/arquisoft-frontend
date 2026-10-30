import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCambiarFechaFinMapaRuta } from './useCambiarFechaFinMapaRuta';
import type { MapaRuta } from '../models/MapaRuta';
import { mensajeErrorCambioFechaFin } from '../utils/errores-mapa-ruta';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';
import { fechaIso, validarFechaFinPosterior } from '../../../shared/validation';

const schema = z
  .object({
    fechaInicio: fechaIso(),
    fechaFin: fechaIso(),
  })
  .superRefine(validarFechaFinPosterior);

export type CambiarFechaFinValues = z.infer<typeof schema>;

interface Opciones {
  mapa: MapaRuta;
  onCerrar: () => void;
}

export function useCambiarFechaFinMapaRutaForm({ mapa, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<CambiarFechaFinValues>({
    resolver: zodResolver(schema),
    defaultValues: { fechaInicio: mapa.fechaInicio, fechaFin: mapa.fechaFin },
    mode: 'onTouched',
  });
  const { isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useCambiarFechaFinMapaRuta();

  function irAlCampo(campo: string) {
    if (campo === 'fechaFin') form.setFocus('fechaFin');
  }

  function alError(err: unknown) {
    const mensaje = mensajeErrorCambioFechaFin(err);
    toast.error('No se pudo cambiar la fecha de fin', mensaje);
    if (hasApiErrorCode(err, 'MAPA_RUTA_NO_ENCONTRADO')) {
      onCerrar();
      return;
    }
    const delCampo = getApiFieldErrors(err).find((fe) => fe.field === 'fechaFin');
    form.setError('fechaFin', { message: delCampo?.message ?? mensaje });
    setResumenVisible(true);
  }

  function modificar(valores: CambiarFechaFinValues) {
    setResumenVisible(false);
    mutate(
      { mapaRutaId: mapa.id, req: { fechaFin: valores.fechaFin } },
      {
        onSuccess: () => {
          toast.success('Fecha de fin actualizada', 'El listado ya muestra la nueva fecha.');
          onCerrar();
        },
        onError: alError,
      },
    );
  }

  function cerrar() {
    form.reset();
    reiniciarMutacion();
    onCerrar();
  }

  const enviar = form.handleSubmit(modificar, () => setResumenVisible(true));

  return {
    form,
    enviar,
    enviando: isPending,
    cerrar,
    isDirty,
    resumenVisible,
    irAlCampo,
  };
}
