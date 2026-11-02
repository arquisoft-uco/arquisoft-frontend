import { useId, useRef } from 'react';
import { useParametrosListado } from '../../../../shared/hooks/useParametrosListado';
import ConsultarParticipacionesEstudiante from './ConsultarParticipacionesEstudiante';
import ConsultarVersionesArtefactoEstudiante from './ConsultarVersionesArtefactoEstudiante';

const RAIZ = 'flex flex-col gap-8';
const SECCION = 'flex flex-col gap-4 scroll-mt-4';
const TITULO = 'text-lg font-semibold text-on-surface';

export default function MisArtefactosEstudiante() {
  const idArtefactos = useId();
  const idVersiones = useId();
  const seccionVersiones = useRef<HTMLElement>(null);
  const parametros = useParametrosListado();

  function verVersiones(artefactoId: string) {
    parametros.cambiar({ artefacto: artefactoId });
    seccionVersiones.current?.scrollIntoView?.({ block: 'start' });
  }

  return (
    <div className={RAIZ}>
      <section aria-labelledby={idArtefactos} className={SECCION}>
        <h2 id={idArtefactos} className={TITULO}>
          Mis artefactos
        </h2>
        <ConsultarParticipacionesEstudiante onVerVersiones={verVersiones} />
      </section>
      <section ref={seccionVersiones} aria-labelledby={idVersiones} className={SECCION}>
        <h2 id={idVersiones} className={TITULO}>
          Versiones y revisiones
        </h2>
        <ConsultarVersionesArtefactoEstudiante />
      </section>
    </div>
  );
}
