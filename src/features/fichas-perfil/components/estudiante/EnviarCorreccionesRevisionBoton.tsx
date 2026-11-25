import { useId } from 'react';
import { Send } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';

interface Props {
  idRevision: string;
  etiquetaItem: string;
  motivo: string | null;
  cargando: boolean;
  onEnviar: () => void;
}

export default function EnviarCorreccionesRevisionBoton({
  idRevision,
  etiquetaItem,
  motivo,
  cargando,
  onEnviar,
}: Props) {
  const idMotivo = `motivo-correcciones-${idRevision}-${useId()}`;

  return (
    <div className="acciones-fila flex flex-col items-start gap-1 sm:items-end">
      <Button
        variante="primario"
        tamano="sm"
        icono={Send}
        aria-label={`Enviar correcciones de la revisión de ${etiquetaItem}`}
        aria-describedby={motivo ? idMotivo : undefined}
        disabled={motivo !== null}
        cargando={cargando}
        onClick={onEnviar}
      >
        <span className="sm:hidden">Enviar</span>
        <span className="hidden sm:inline">Enviar correcciones</span>
      </Button>
      {motivo && (
        <p id={idMotivo} className="max-w-xs text-[12px] text-on-surface-secondary sm:text-right">
          {motivo}
        </p>
      )}
    </div>
  );
}
