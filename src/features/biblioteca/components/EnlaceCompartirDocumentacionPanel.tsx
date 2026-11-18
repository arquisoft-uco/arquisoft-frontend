import { Copy } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import Field from '../../../shared/components/ui/Field';
import Notice from '../../../shared/components/ui/Notice';
import SidePanel from '../../../shared/components/ui/SidePanel';
import { toast } from '../../../shared/hooks/useToast';
import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { Documentacion } from '../models/Documentacion';
import { copiarAlPortapapeles } from '../utils/copiar-al-portapapeles';

const PIE = 'actions-row border-t border-border p-4 sm:px-6';

interface Props {
  documentacion: Documentacion;
  enlace: EnlaceDescargaVersion;
  onCerrar: () => void;
}

export default function EnlaceCompartirDocumentacionPanel({
  documentacion,
  enlace,
  onCerrar,
}: Props) {
  async function copiar() {
    if (await copiarAlPortapapeles(enlace.url)) {
      toast.success('Enlace copiado');
    } else {
      toast.error('No se pudo copiar', 'Selecciona el texto del campo y cópialo manualmente');
    }
  }

  return (
    <SidePanel
      titulo="Compartir documentación"
      descripcion={`Versión ${documentacion.entregableProyectoGrado.versionEntregable}`}
      onCerrar={onCerrar}
      pie={() => (
        <div className={PIE}>
          <Button variante="secundario" onClick={onCerrar}>
            Cerrar
          </Button>
          <Button icono={Copy} onClick={() => void copiar()}>
            Copiar enlace
          </Button>
        </div>
      )}
    >
      <div className="flex flex-col gap-4">
        <Notice variante="info">
          El enlace vence el {formatearFechaCreacion(enlace.expiraEn)}. Quien lo reciba puede
          descargar sin iniciar sesión.
        </Notice>
        <Field etiqueta="Enlace para compartir">
          {(control) => (
            <input
              {...control}
              readOnly
              value={enlace.url}
              onFocus={(evento) => evento.currentTarget.select()}
              className="field-input"
            />
          )}
        </Field>
      </div>
    </SidePanel>
  );
}
