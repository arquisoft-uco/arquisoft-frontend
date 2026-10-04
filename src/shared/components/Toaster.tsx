import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';
import type { Toast, ToastLevel } from '../stores/toastStore';

const DURACION_SALIDA = 200;

const REGION =
  'fixed inset-x-4 bottom-4 z-[9999] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96 max-sm:in-data-[panel-abierto]:top-4 max-sm:in-data-[panel-abierto]:bottom-auto sm:in-data-[panel-abierto]:bottom-24';
const TARJETA =
  'flex items-start gap-3 rounded-xl border border-border bg-surface p-3 pr-1.5 shadow-dropdown';
const ICONO = 'flex size-8 shrink-0 items-center justify-center rounded-full';
const TEXTOS = 'min-w-0 flex-1';
const TITULO = 'text-sm font-semibold text-on-surface';
const MENSAJE = 'mt-0.5 text-sm text-on-surface-secondary';
const CERRAR =
  'ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-on-surface-secondary hover:bg-muted';

const NIVELES: Record<ToastLevel, { icono: LucideIcon; clases: string }> = {
  success: { icono: CircleCheck, clases: 'bg-secondary-muted text-secondary-muted-foreground' },
  info: { icono: Info, clases: 'bg-primary-muted text-primary-muted-foreground' },
  error: { icono: CircleAlert, clases: 'bg-danger-muted text-danger-muted-foreground' },
};

interface PropsAviso {
  aviso: Toast;
}

function ToastItem({ aviso }: PropsAviso) {
  const descartar = useToastStore((state) => state.dismiss);
  const [saliendo, setSaliendo] = useState(false);
  const [cursorDentro, setCursorDentro] = useState(false);
  const [focoDentro, setFocoDentro] = useState(false);
  const restante = useRef(aviso.duration);
  const pausado = cursorDentro || focoDentro;
  const { icono: Icono, clases } = NIVELES[aviso.level];

  useEffect(() => {
    if (aviso.duration === 0 || pausado || saliendo) return;
    const inicio = Date.now();
    const plazo = setTimeout(() => setSaliendo(true), restante.current);
    return () => {
      clearTimeout(plazo);
      restante.current -= Date.now() - inicio;
    };
  }, [aviso.duration, pausado, saliendo]);

  useEffect(() => {
    if (!saliendo) return;
    const salida = setTimeout(() => descartar(aviso.id), DURACION_SALIDA);
    return () => clearTimeout(salida);
  }, [saliendo, descartar, aviso.id]);

  return (
    <div
      role={aviso.level === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setCursorDentro(true)}
      onMouseLeave={() => setCursorDentro(false)}
      onFocus={() => setFocoDentro(true)}
      onBlur={() => setFocoDentro(false)}
      className={[TARJETA, saliendo ? 'animate-toast-out' : 'animate-toast-in'].join(' ')}
    >
      <span className={[ICONO, clases].join(' ')}>
        <Icono size={16} aria-hidden />
      </span>
      <div className={TEXTOS}>
        <p className={TITULO}>{aviso.title}</p>
        {aviso.message && <p className={MENSAJE}>{aviso.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => setSaliendo(true)}
        aria-label="Cerrar notificación"
        className={CERRAR}
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}

export default function Toaster() {
  const avisos = useToastStore((state) => state.toasts);

  return createPortal(
    <div aria-label="Notificaciones" className={REGION}>
      {avisos.map((aviso) => (
        <ToastItem key={aviso.id} aviso={aviso} />
      ))}
    </div>,
    document.body,
  );
}
