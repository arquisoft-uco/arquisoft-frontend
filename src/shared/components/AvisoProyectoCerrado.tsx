import Notice from './ui/Notice';

interface Props {
  proyectoFinalizado: boolean;
  proyectoCancelado: boolean;
  detalle?: string;
}

const COLA = 'Puedes consultar la información, pero ya no admite cambios ni descargas.';

export default function AvisoProyectoCerrado({
  proyectoFinalizado,
  proyectoCancelado,
  detalle = COLA,
}: Props) {
  if (proyectoCancelado) {
    return <Notice variante="advertencia">Este proyecto fue cancelado. {detalle}</Notice>;
  }
  if (proyectoFinalizado) {
    return <Notice variante="advertencia">Este proyecto está finalizado. {detalle}</Notice>;
  }
  return null;
}
