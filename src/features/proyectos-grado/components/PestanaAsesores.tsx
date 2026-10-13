import { useOutletContext } from 'react-router';
import type { ContextoDetalleProyectoGrado } from '../models/ContextoDetalleProyectoGrado';
import AsesoresProyectoGradoPanel from './coordinador/AsesoresProyectoGradoPanel';

interface Props {
  proyectoGradoId: string;
}

export default function PestanaAsesores({ proyectoGradoId }: Props) {
  const contexto = useOutletContext<ContextoDetalleProyectoGrado | undefined>();

  return (
    <AsesoresProyectoGradoPanel
      proyectoGradoId={proyectoGradoId}
      titulo={contexto?.titulo ?? 'Proyecto de grado'}
      finalizado={contexto?.finalizado ?? false}
    />
  );
}
