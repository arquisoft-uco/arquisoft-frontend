import { useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useWatch } from 'react-hook-form';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { LIMITES } from '../../../../shared/validation';
import { useNuevaFichaForm } from '../../hooks/useNuevaFichaForm';
import { DISPOSICION } from '../disposicion';
import NuevaFichaForm from './NuevaFichaForm';
import NuevaFichaResumenPanel from './NuevaFichaResumenPanel';

const TARJETA = 'max-w-3xl rounded-xl border border-border bg-surface shadow-card';
const RUTA_LISTADO = '/fichas-perfil';

export default function NuevaFichaContenido() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);

  const volver = () => navigate({ pathname: RUTA_LISTADO, search });
  const nueva = useNuevaFichaForm({ alRegistrar: volver });
  const valores = useWatch({ control: nueva.form.control });
  const { asesores, estudiantes } = nueva.catalogos;

  function salir(evento?: MouseEvent<HTMLAnchorElement>) {
    if (!nueva.isDirty) {
      if (!evento) volver();
      return;
    }
    evento?.preventDefault();
    setConfirmando(true);
  }

  const idsElegidos = valores.idEstudiantes ?? [];
  const nombresElegidos = (estudiantes.data ?? [])
    .filter((e) => idsElegidos.includes(e.id))
    .map((e) => e.nombre);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Nueva ficha de perfil"
        descripcion={`Define el proyecto, elige al asesor y agrega hasta ${LIMITES.ESTUDIANTES_MAX} estudiantes.`}
        migas={[
          { etiqueta: 'Fichas de perfil', to: RUTA_LISTADO + search, onClick: salir },
          { etiqueta: 'Nueva ficha' },
        ]}
      />
      <div className={DISPOSICION.contenedor}>
        <div className={DISPOSICION.principal}>
          <div className={TARJETA}>
            <NuevaFichaForm
              nueva={nueva}
              titulo={valores.titulo ?? ''}
              onCancelar={() => salir()}
            />
          </div>
        </div>
        <div className={DISPOSICION.lateral}>
          <NuevaFichaResumenPanel
            titulo={valores.titulo ?? ''}
            asesor={asesores.data?.find((a) => a.id === valores.idAsesorFicha)?.nombre}
            estudiantes={nombresElegidos}
          />
        </div>
      </div>
      {confirmando && (
        <ConfirmDialog
          titulo="¿Descartar los cambios?"
          descripcion="Tienes cambios sin guardar. Si sales ahora, se perderán."
          labelConfirmar="Descartar"
          labelCancelar="Seguir editando"
          variante="advertencia"
          onConfirmar={volver}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </div>
  );
}
