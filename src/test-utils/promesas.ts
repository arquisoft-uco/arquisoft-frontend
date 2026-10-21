export function diferida() {
  let resolver: () => void = () => undefined;
  let rechazar: (motivo: unknown) => void = () => undefined;
  const promesa = new Promise<void>((resolve, reject) => {
    resolver = resolve;
    rechazar = reject;
  });
  return { promesa, resolver, rechazar };
}
