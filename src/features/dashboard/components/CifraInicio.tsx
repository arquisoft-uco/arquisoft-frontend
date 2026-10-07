interface Props {
  etiqueta: string;
  valor?: number;
}

export default function CifraInicio({ etiqueta, valor }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-3xl font-bold text-on-surface">
        {valor === undefined ? '—' : valor.toLocaleString('es-CO')}
      </p>
      <p className="text-sm text-on-surface-secondary">{etiqueta}</p>
    </div>
  );
}
