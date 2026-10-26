import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarRepositorios from './administrador/ConsultarRepositorios';
import GenerarRepositorioPanel from './administrador/GenerarRepositorioPanel';

export default function AdministradorView() {
  const [generando, setGenerando] = useState(false);
  const abrir = () => setGenerando(true);

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
      <ConsultarRepositorios onGenerar={abrir} />
      {generando && <GenerarRepositorioPanel onCerrar={() => setGenerando(false)} />}
    </div>
  );
}
