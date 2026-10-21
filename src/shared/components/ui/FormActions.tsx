import Button from './Button';

const RAIZ =
  'sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6';
const ESTADO = 'inline-flex items-center gap-2 text-sm text-on-surface-secondary';
const PUNTO = 'size-2 rounded-full bg-tertiary';
const CON_CAMBIOS = 'Cambios sin guardar';
const SIN_CAMBIOS = 'Sin cambios';

interface Props {
  accion?: string;
  accionEnviando?: string;
  enviando?: boolean;
  sucio?: boolean;
  sinCambios?: boolean;
  nota?: string;
  formId?: string;
  onCancelar: () => void;
}

export default function FormActions({
  accion,
  accionEnviando,
  enviando = false,
  sucio = false,
  sinCambios = false,
  nota,
  formId,
  onCancelar,
}: Props) {
  const conPunto = !nota && sucio;
  const estado = nota || (sucio ? CON_CAMBIOS : SIN_CAMBIOS);

  return (
    <div className={RAIZ}>
      <p className={ESTADO}>
        {conPunto && <span className={PUNTO} aria-hidden="true" />}
        {estado}
      </p>
      <div className="actions-row">
        <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
          {sucio ? 'Cancelar' : 'Cerrar'}
        </Button>
        {accion && (
          <Button type="submit" form={formId} cargando={enviando} disabled={sinCambios}>
            {enviando && accionEnviando ? accionEnviando : accion}
          </Button>
        )}
      </div>
    </div>
  );
}
