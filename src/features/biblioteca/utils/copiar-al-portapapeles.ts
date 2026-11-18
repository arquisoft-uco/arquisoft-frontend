export async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
