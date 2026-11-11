import InsigniaProyectoCerrado from './InsigniaProyectoCerrado';

interface Props {
  proyecto: { nombreProyecto: string; proyectoFinalizado: boolean; proyectoCancelado: boolean };
  className?: string;
}

export default function ProyectoConInsignia({ proyecto, className }: Props) {
  return (
    <span className="flex flex-col items-start gap-1">
      <span className={className}>{proyecto.nombreProyecto}</span>
      <InsigniaProyectoCerrado
        proyectoFinalizado={proyecto.proyectoFinalizado}
        proyectoCancelado={proyecto.proyectoCancelado}
      />
    </span>
  );
}
