import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTrampaDeFoco } from '../../hooks/useTrampaDeFoco';
import ConfirmDialog from '../ConfirmDialog';
import IconButton from './IconButton';

const FONDO = 'fixed inset-0 z-40 bg-black/40 animate-fade-in';
const PANEL =
  'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface shadow-lg animate-slide-in-right sm:max-w-140 sm:border-l sm:border-border';
const CABECERA =
  'flex items-start justify-between gap-4 border-b border-border py-4 pl-4 pr-2 sm:py-5 sm:pl-6';
const ENCABEZADO = 'flex min-w-0 flex-1 items-start gap-3';
const TEXTOS = 'min-w-0 break-words';
const TITULO = 'text-xl font-bold text-on-surface';
const DESCRIPCION = 'mt-1 text-sm text-on-surface-secondary';
const ACCIONES = 'flex shrink-0 items-center gap-1';
const CUERPO = 'flex-1 overflow-y-auto p-4 sm:p-6';
const PIE = 'shrink-0';

interface Props {
  titulo: string;
  descripcion?: string;
  inicio?: ReactNode;
  fin?: ReactNode;
  onCerrar: () => void;
  sucio?: boolean;
  ocupado?: boolean;
  pie?: (solicitarCierre: () => void) => ReactNode;
  children: ReactNode;
}

export default function SidePanel({
  titulo,
  descripcion,
  inicio,
  fin,
  onCerrar,
  sucio = false,
  ocupado = false,
  pie,
  children,
}: Props) {
  const idTitulo = useId();
  const idDescripcion = useId();
  const panel = useRef<HTMLDivElement>(null);
  const cuerpo = useRef<HTMLDivElement>(null);
  const [confirmando, setConfirmando] = useState(false);

  function solicitarCierre() {
    if (ocupado) return;
    if (sucio) setConfirmando(true);
    else onCerrar();
  }

  function descartar() {
    setConfirmando(false);
    onCerrar();
  }

  useTrampaDeFoco({ contenedor: panel, focoInicial: cuerpo, alEscape: solicitarCierre });

  // El atributo deja que el Toaster se coloque sobre el pie del panel en lugar de tapar su botón principal.
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.dataset.panelAbierto = '';
    return () => {
      document.body.style.overflow = anterior;
      delete document.body.dataset.panelAbierto;
    };
  }, []);

  return createPortal(
    <>
      <div
        className={FONDO}
        onMouseDown={(evento) => evento.preventDefault()}
        onClick={solicitarCierre}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descripcion ? idDescripcion : undefined}
        tabIndex={-1}
        className={PANEL}
      >
        <div className={CABECERA}>
          <div className={ENCABEZADO}>
            {inicio}
            <div className={TEXTOS}>
              <h2 id={idTitulo} className={TITULO}>
                {titulo}
              </h2>
              {descripcion && (
                <p id={idDescripcion} className={DESCRIPCION}>
                  {descripcion}
                </p>
              )}
            </div>
          </div>
          <div className={ACCIONES}>
            {fin}
            <IconButton etiqueta="Cerrar panel" icono={X} onClick={solicitarCierre} />
          </div>
        </div>
        <div ref={cuerpo} className={CUERPO}>
          {children}
        </div>
        {pie && <div className={PIE}>{pie(solicitarCierre)}</div>}
      </div>
      {confirmando && (
        <ConfirmDialog
          titulo="¿Descartar los cambios?"
          descripcion="Tienes cambios sin guardar. Si cierras ahora, se perderán."
          labelConfirmar="Descartar"
          labelCancelar="Seguir editando"
          variante="advertencia"
          onConfirmar={descartar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>,
    document.body,
  );
}
