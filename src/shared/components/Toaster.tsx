import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info, Bug, XCircle, X } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';
import type { Toast, ToastLevel } from '../stores/toastStore';

// ── Level config ──────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<
  ToastLevel,
  { icon: React.ReactNode; bar: string; container: string; title: string }
> = {
  success: {
    icon:      <CheckCircle2 size={18} aria-hidden />,
    bar:       'bg-secondary',
    container: 'bg-secondary-muted border-secondary/25',
    title:     'text-secondary-muted-foreground',
  },
  info: {
    icon:      <Info size={18} aria-hidden />,
    bar:       'bg-primary',
    container: 'bg-primary-muted border-primary/25',
    title:     'text-primary-muted-foreground',
  },
  debug: {
    icon:      <Bug size={18} aria-hidden />,
    bar:       'bg-on-surface-secondary',
    container: 'bg-surface-secondary border-border',
    title:     'text-on-surface',
  },
  error: {
    icon:      <XCircle size={18} aria-hidden />,
    bar:       'bg-danger',
    container: 'bg-danger/8 border-danger/30',
    title:     'text-danger',
  },
};

// ── ToastItem ─────────────────────────────────────────────────────────────────

const EXIT_DURATION = 200; // ms — matches toast-out keyframe

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const [exiting, setExiting] = useState(false);

  const close = useCallback(() => {
    setExiting(true);
    setTimeout(() => dismiss(toast.id), EXIT_DURATION);
  }, [dismiss, toast.id]);

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration === 0) return;
    const t = setTimeout(close, toast.duration);
    return () => clearTimeout(t);
  }, [close, toast.duration]);

  const cfg = LEVEL_CONFIG[toast.level];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'relative flex w-80 overflow-hidden rounded-xl border shadow-[var(--shadow-dropdown)]',
        cfg.container,
        exiting ? 'animate-toast-out' : 'animate-toast-in',
      ].join(' ')}
    >
      {/* Colored left bar */}
      <div className={`w-1 shrink-0 rounded-l-xl ${cfg.bar}`} aria-hidden />

      {/* Content */}
      <div className="flex min-w-0 flex-1 gap-3 px-3 py-3">
        <span className={`mt-0.5 shrink-0 ${cfg.title}`}>{cfg.icon}</span>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold leading-snug ${cfg.title}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-0.5 text-xs leading-relaxed text-on-surface-secondary">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Cerrar notificación"
          className="ml-1 mt-0.5 shrink-0 rounded-md p-0.5 text-on-surface-secondary transition-colors hover:bg-black/8 hover:text-on-surface"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Toaster ───────────────────────────────────────────────────────────────────

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return createPortal(
    <div
      aria-label="Notificaciones"
      className="fixed right-4 top-4 z-[9999] flex flex-col gap-2"
    >
      {[...toasts].reverse().map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body,
  );
}
