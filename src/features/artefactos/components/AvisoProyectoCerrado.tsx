import Notice from '../../../shared/components/ui/Notice';

interface Props {
  proyectoFinalizado: boolean;
  proyectoCancelado: boolean;
}

const COLA = 'Puedes consultar la información, pero ya no admite cambios ni descargas.';

export default function AvisoProyectoCerrado({ proyectoFinalizado, proyectoCancelado }: Props) {
  if (proyectoCancelado) {
    return <Notice variante="advertencia">Este proyecto fue cancelado. {COLA}</Notice>;
  }
  if (proyectoFinalizado) {
    return <Notice variante="advertencia">Este proyecto está finalizado. {COLA}</Notice>;
  }
  return null;
}
