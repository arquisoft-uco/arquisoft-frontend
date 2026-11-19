import { useState } from 'react';
import { UserMinus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import Button from '../../../../shared/components/ui/Button';
import IconButton from '../../../../shared/components/ui/IconButton';
import Notice from '../../../../shared/components/ui/Notice';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useJuradosEvaluacion } from '../../hooks/useJuradosEvaluacion';
import { useResumenEvaluacion } from '../../hooks/useResumenEvaluacion';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';
import ListadoJuradosEvaluacion from '../estudiante/ListadoJuradosEvaluacion';
import AsignarJuradosEvaluacionPanel from './AsignarJuradosEvaluacionPanel';
import RemoverJuradoEvaluacionDialog from './RemoverJuradoEvaluacionDialog';

const RAIZ = 'flex flex-col gap-6';
const DESCRIPCION_SIN_RESUMEN = 'Consulta y administra los jurados asignados a esta evaluación.';
const DESCRIPCION_VACIO = 'Esta evaluación aún no tiene jurados asignados.';

export default function JuradosEvaluacionCoordinadorView() {
  const { evaluacionId = '' } = useParams();
  const navigate = useNavigate();
  const { resumen, search } = useResumenEvaluacion(evaluacionId);
  const listado = useJuradosEvaluacion(evaluacionId);
  const [juradoARemover, setJuradoARemover] = useState<EvaluacionJurado | null>(null);
  const [asignando, setAsignando] = useState(false);

  const finalizada = resumen?.finalizada === true;
  const rutaListado = `/evaluaciones${search}`;
  const descripcion = resumen
    ? `${resumen.proyecto} · versión ${resumen.version}`
    : DESCRIPCION_SIN_RESUMEN;
  const migas = [{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: 'Jurados asignados' }];
  const retrocederPagina = listado.data?.content.length === 1 && listado.page > 0;

  const accionVacio =
    resumen && !finalizada ? (
      <Button onClick={() => setAsignando(true)}>Asignar jurados</Button>
    ) : undefined;

  return (
    <div className={RAIZ}>
      <PageHeader titulo="Jurados asignados" descripcion={descripcion} migas={migas} />

      {finalizada && (
        <Notice variante="info">
          Esta evaluación está finalizada y no admite cambios de jurados.
        </Notice>
      )}

      <ListadoJuradosEvaluacion
        listado={listado}
        onVolver={() => navigate(rutaListado)}
        encabezadoAcciones="Acciones"
        acciones={(jurado) => (
          <IconButton
            etiqueta={`Remover a ${jurado.jurado.nombre}`}
            icono={UserMinus}
            tono="peligro"
            rotulo="Remover"
            disabled={finalizada}
            onClick={() => setJuradoARemover(jurado)}
          />
        )}
        descripcionVacio={DESCRIPCION_VACIO}
        accionVacio={accionVacio}
      />

      {juradoARemover && (
        <RemoverJuradoEvaluacionDialog
          evaluacionId={evaluacionId}
          jurado={juradoARemover}
          retrocederPagina={retrocederPagina}
          onRetroceder={() => listado.goToPage(listado.page - 1)}
          onCerrar={() => setJuradoARemover(null)}
        />
      )}

      {asignando && resumen && (
        <AsignarJuradosEvaluacionPanel
          evaluacion={{
            id: evaluacionId,
            entregable: { proyecto: resumen.proyecto, version: resumen.version },
          }}
          onCerrar={() => setAsignando(false)}
        />
      )}
    </div>
  );
}
