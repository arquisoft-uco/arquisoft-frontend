import Badge from './ui/Badge';

interface Props {
  proyectoFinalizado: boolean;
  proyectoCancelado: boolean;
}

export default function InsigniaProyectoCerrado({ proyectoFinalizado, proyectoCancelado }: Props) {
  if (proyectoCancelado) return <Badge variante="peligro">Proyecto cancelado</Badge>;
  if (proyectoFinalizado) return <Badge variante="neutro">Proyecto finalizado</Badge>;
  return null;
}
