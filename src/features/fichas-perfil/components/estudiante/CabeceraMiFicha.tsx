import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import type { MiFichaPerfilResponse } from '../../models/MiFichaPerfilResponse';
import Button from '../../../../shared/components/ui/Button';
import Notice from '../../../../shared/components/ui/Notice';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { FechaDeEstado, InsigniaEstadoFicha } from '../FichaCeldas';
import EditarTituloForm from './EditarTituloForm';

interface Props {
  ficha: MiFichaPerfilResponse;
  editable: boolean;
}

export default function CabeceraMiFicha({ ficha, editable }: Props) {
  const [editandoTitulo, setEditandoTitulo] = useState(false);

  return (
    <>
      <PageHeader
        titulo={ficha.tituloProyecto}
        insignia={
          <InsigniaEstadoFicha
            estadoId={ficha.estadoActual.id}
            nombre={ficha.estadoActual.nombre}
          />
        }
        meta={
          <>
            Mi ficha de perfil · Actualizada el{' '}
            <FechaDeEstado iso={ficha.estadoActual.fechaActualizacion} />
          </>
        }
        acciones={
          editable && (
            <Button variante="secundario" icono={Edit3} onClick={() => setEditandoTitulo(true)}>
              Editar título
            </Button>
          )
        }
      />
      {!editable && (
        <Notice variante="info" titulo="Tu ficha no admite cambios en este estado">
          Solo puedes editar el título y los ítems mientras la ficha está en construcción. Si
          necesitas cambiar algo, pide a tu asesor que la devuelva a construcción.
        </Notice>
      )}
      {editandoTitulo && editable && (
        <EditarTituloForm
          key={ficha.id}
          tituloActual={ficha.tituloProyecto}
          onCerrar={() => setEditandoTitulo(false)}
        />
      )}
    </>
  );
}
