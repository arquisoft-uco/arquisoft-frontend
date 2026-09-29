interface Props {
  titulo: string;
  descripcion: string;
}

export default function PestanaEnConstruccion({ titulo, descripcion }: Props) {
  return (
    <section
      role="status"
      className="rounded-xl border border-border bg-surface p-5 shadow-card"
    >
      <h2 className="text-base font-semibold text-on-surface">{titulo}</h2>
      <p className="mt-1 text-sm text-on-surface-secondary">{descripcion}</p>
    </section>
  );
}
