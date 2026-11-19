import Field from '../../../shared/components/ui/Field';

interface Props {
  frase: string;
  valor: string;
  onCambiar: (valor: string) => void;
}

export default function CampoFraseConfirmacion({ frase, valor, onCambiar }: Props) {
  return (
    <Field etiqueta={`Escribe «${frase}» para continuar`}>
      {(control) => (
        <input
          {...control}
          type="text"
          value={valor}
          onChange={(e) => onCambiar(e.target.value)}
          autoComplete="off"
          className="field-input"
        />
      )}
    </Field>
  );
}
