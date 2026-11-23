// La tabla y las tarjetas conviven en el DOM y CSS oculta una: el foco va a la instancia que se ve.
export function enfocarElementoVisible(raiz: ParentNode | null, selector: string) {
  if (!raiz) return;
  const candidatos = Array.from(raiz.querySelectorAll<HTMLElement>(selector));
  const visible = candidatos.find((el) => el.getClientRects().length > 0) ?? candidatos[0];
  visible?.focus();
}
