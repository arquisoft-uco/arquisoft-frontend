import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import type { Documentacion } from '../models/Documentacion';
import type { DestinoEstadoDocumentacion } from '../utils/transiciones-estado-documentacion';

const SIN_TITULO = 'Sin título';

const TEXTOS_POR_DESTINO: Record<
  DestinoEstadoDocumentacion,
  {
    titulo: string;
    variante: 'advertencia' | 'peligro';
    consecuencias: string[];
    labelConfirmar: string;
  }
> = {
  PUBLICADO: {
    titulo: '¿Publicar la documentación?',
    variante: 'advertencia',
    consecuencias: [
      'Asesores, coordinadores y estudiantes podrán verla en la Biblioteca.',
      'Podrás marcarla como no publicada más adelante.',
      'No vuelve a Pendiente.',
    ],
    labelConfirmar: 'Publicar',
  },
  NO_PUBLICADO: {
    titulo: '¿Marcar como no publicada?',
    variante: 'peligro',
    consecuencias: [
      'Asesores, coordinadores y estudiantes dejan de verla en la Biblioteca.',
      'Podrás volver a publicarla más adelante.',
      'No vuelve a Pendiente.',
    ],
    labelConfirmar: 'Marcar como no publicada',
  },
};

interface Props {
  documentacion: Documentacion;
  destino: DestinoEstadoDocumentacion;
  cargando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmarCambioEstadoDocumentacion({
  documentacion,
  destino,
  cargando,
  onConfirmar,
  onCancelar,
}: Props) {
  const textos = TEXTOS_POR_DESTINO[destino];

  return (
    <ConfirmDialog
      variante={textos.variante}
      titulo={textos.titulo}
      descripcion={`${documentacion.tituloProyecto ?? SIN_TITULO} · Versión ${documentacion.entregableProyectoGrado.versionEntregable}`}
      consecuencias={textos.consecuencias}
      labelConfirmar={textos.labelConfirmar}
      cargando={cargando}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    />
  );
}
