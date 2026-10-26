import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import type { RepositorioArtefacto } from '../models/RepositorioArtefacto';
import ConsultarRepositorios from './administrador/ConsultarRepositorios';
import GenerarRepositorioPanel from './administrador/GenerarRepositorioPanel';
import ModificarRepositorioPanel from './administrador/ModificarRepositorioPanel';

export default function AdministradorView() {
  const [generando, setGenerando] = useState(false);
  const [repositorioEnEdicion, setRepositorioEnEdicion] = useState<RepositorioArtefacto | null>(
    null,
  );
  const abrir = () => {
    setRepositorioEnEdicion(null);
    setGenerando(true);
  };
  const editar = (repositorio: RepositorioArtefacto) => {
    setGenerando(false);
    setRepositorioEnEdicion(repositorio);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Repositorio de artefactos"
        descripcion="Consulta y genera los repositorios de artefactos"
        acciones={
          <Button icono={Plus} onClick={abrir}>
            Generar repositorio
          </Button>
        }
      />
      <ConsultarRepositorios onGenerar={abrir} onEditar={editar} />
      {generando && <GenerarRepositorioPanel onCerrar={() => setGenerando(false)} />}
      {repositorioEnEdicion && (
        <ModificarRepositorioPanel
          key={repositorioEnEdicion.id}
          repositorio={repositorioEnEdicion}
          onCerrar={() => setRepositorioEnEdicion(null)}
        />
      )}
    </div>
  );
}
