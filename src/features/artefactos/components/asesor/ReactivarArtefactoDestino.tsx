import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import type { ArtefactoAReactivar } from '../../models/ArtefactoAReactivar';

const LISTA = 'flex flex-col gap-3 text-sm';
const ETIQUETA = 'block text-[13px] text-on-surface-secondary';
const VALOR = 'font-medium text-on-surface';

interface Props {
  artefacto: ArtefactoAReactivar;
}

export default function ReactivarArtefactoDestino({ artefacto }: Props) {
  return (
    <FormSection titulo="Destino">
      <dl className={LISTA}>
        <div>
          <dt className={ETIQUETA}>Proyecto de grado</dt>
          <dd className={VALOR}>{artefacto.nombreProyecto}</dd>
        </div>
        <div>
          <dt className={ETIQUETA}>Documento</dt>
          <dd className={VALOR}>
            {artefacto.nombreDocumento} · versión {artefacto.versionDocumento}
          </dd>
        </div>
      </dl>
      <Notice variante="info">
        Este artefacto está omitido. Al reactivarlo conserva sus versiones, revisiones y
        observaciones, y quedan vinculados solo los estudiantes que elijas: los demás dejan de estar
        vinculados.
      </Notice>
    </FormSection>
  );
}
